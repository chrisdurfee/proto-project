<?php declare(strict_types=1);
namespace Modules\Messaging\Services;

use Common\Services\Service;
use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\ConversationParticipant;
use Modules\Messaging\Models\Message;
use Proto\Services\ServiceResult;

/**
 * ConversationService
 *
 * Handles conversation creation, participant management,
 * and conversation data enrichment.
 *
 * @package Modules\Messaging\Services
 */
class ConversationService extends Service
{
	/**
	 * Find an existing direct conversation between two users,
	 * or create a new one if none exists.
	 *
	 * @param int $userId
	 * @param int $participantId
	 * @return ServiceResult
	 */
	public function findOrCreate(int $userId, int $participantId): ServiceResult
	{
		if ($userId === $participantId)
		{
			return ServiceResult::failure('Cannot create a conversation with yourself');
		}

		$participant = modules()->user()->get($participantId);
		if (!$participant)
		{
			return ServiceResult::failure('Participant user not found', 'NOT_FOUND');
		}

		$existingId = Conversation::findByUser($userId, $participantId);
		if (is_int($existingId))
		{
			return ServiceResult::success((object)[
				'id' => $existingId,
				'existing' => true
			]);
		}

		return $this->createDirectConversation($userId, $participantId);
	}

	/**
	 * Create a new direct conversation between two users.
	 *
	 * @param int $userId
	 * @param int $participantId
	 * @return ServiceResult
	 */
	public function createDirectConversation(int $userId, int $participantId): ServiceResult
	{
		if ($userId === $participantId)
		{
			return ServiceResult::failure('Cannot create a conversation with yourself');
		}

		$existingId = Conversation::findByUser($userId, $participantId);
		if (is_int($existingId))
		{
			return ServiceResult::success((object)[
				'id' => $existingId,
				'existing' => true
			]);
		}

		$conversation = new Conversation((object)[
			'type' => 'direct',
			'createdBy' => $userId
		]);
		$conversation->add();

		if (!$conversation->id)
		{
			return ServiceResult::failure('Failed to create conversation');
		}

		$success = $this->addParticipants((int)$conversation->id, [$userId, $participantId]);
		if (!$success)
		{
			return ServiceResult::failure('Failed to add participants');
		}

		$this->notifyUserConversation($userId, (int)$conversation->id);

		return ServiceResult::success((object)[
			'id' => (int)$conversation->id,
			'existing' => false
		]);
	}

	/**
	 * Add multiple participants to a conversation and send Redis notifications.
	 *
	 * @param int $conversationId
	 * @param array $userIds
	 * @return bool
	 */
	public function addParticipants(int $conversationId, array $userIds): bool
	{
		$success = true;
		foreach ($userIds as $userId)
		{
			$result = ConversationParticipant::create((object)[
				'conversationId' => $conversationId,
				'userId' => (int)$userId,
				'role' => 'member',
				'joinedAt' => date('Y-m-d H:i:s')
			]);
			if (!$result)
			{
				$success = false;
			}
		}

		foreach ($userIds as $userId)
		{
			$this->notifyUserConversation((int)$userId, $conversationId);
		}

		return $success;
	}

	/**
	 * Get conversation data enriched with unread count.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return object|null
	 */
	public function getConversationData(int $conversationId, int $userId): ?object
	{
		$conversation = Conversation::get($conversationId);
		if (!$conversation)
		{
			return null;
		}

		$row = $conversation->getData();
		$unreadCounts = Message::getUnreadCountsForConversations([$conversationId], $userId);
		$row->unreadCount = $unreadCounts[$conversationId] ?? 0;
		$row->conversationId = $conversationId;

		return $row;
	}

	/**
	 * Enrich conversation rows with unread counts.
	 *
	 * @param array $rows
	 * @param int $userId
	 * @return void
	 */
	public function enrichWithUnreadCounts(array &$rows, int $userId): void
	{
		if (empty($rows))
		{
			return;
		}

		$conversationIds = array_column($rows, 'conversationId');
		$unreadCounts = Message::getUnreadCountsForConversations($conversationIds, $userId);

		foreach ($rows as $row)
		{
			$row->unreadCount = $unreadCounts[$row->conversationId] ?? 0;
		}
	}

	/**
	 * Get participant user IDs mapped to their conversation IDs.
	 *
	 * @param int $userId
	 * @return array<int, array<int>>
	 */
	public function getParticipantConversationMap(int $userId): array
	{
		$participants = ConversationParticipant::fetchWhere([
			['cp.userId', $userId]
		]);

		if (empty($participants))
		{
			return [];
		}

		$participantMap = [];
		foreach ($participants as $participant)
		{
			if (isset($participant->participants) && is_array($participant->participants))
			{
				foreach ($participant->participants as $p)
				{
					$pUserId = $p->userId ?? null;
					if ($pUserId && $pUserId !== $userId)
					{
						if (!isset($participantMap[$pUserId]))
						{
							$participantMap[$pUserId] = [];
						}
						$participantMap[$pUserId][] = $participant->conversationId;
					}
				}
			}
		}

		return $participantMap;
	}

	/**
	 * Build the list of Redis channels a user should subscribe to for sync.
	 *
	 * @param int $userId
	 * @return array
	 */
	public function getSyncChannels(int $userId): array
	{
		$channels = ["user:{$userId}:conversations"];

		$participantMap = $this->getParticipantConversationMap($userId);
		foreach ($participantMap as $participantId => $conversationIds)
		{
			$channels[] = "user:{$participantId}:status";
		}

		return $channels;
	}

	/**
	 * Build a sync response for a conversation update.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param string $action
	 * @return array|null
	 */
	public function buildSyncResponse(int $conversationId, int $userId, string $action = 'merge'): ?array
	{
		if ($action === 'delete')
		{
			return [
				'merge' => [],
				'deleted' => [$conversationId]
			];
		}

		$conversation = $this->getConversationData($conversationId, $userId);
		if (!$conversation)
		{
			return null;
		}

		return [
			'merge' => [$conversation],
			'deleted' => []
		];
	}

	/**
	 * Extract user ID from a Redis status channel name.
	 *
	 * @param string $channel
	 * @return int|null
	 */
	public function extractUserIdFromChannel(string $channel): ?int
	{
		$parts = explode(':', $channel);
		return isset($parts[1]) ? (int)$parts[1] : null;
	}

	/**
	 * Publish a Redis event to notify a user about a conversation change.
	 *
	 * @param int $userId
	 * @param int $conversationId
	 * @param string $action
	 * @return void
	 */
	protected function notifyUserConversation(int $userId, int $conversationId, string $action = 'merge'): void
	{
		events()->emit("redis:user:{$userId}:conversations", [
			'id' => $conversationId,
			'action' => $action
		]);
	}
}
