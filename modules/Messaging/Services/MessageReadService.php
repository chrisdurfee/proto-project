<?php declare(strict_types=1);
namespace Modules\Messaging\Services;

use Common\Services\Service;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * MessageReadService
 *
 * This service handles marking messages as read and related operations.
 *
 * @package Modules\Messaging\Services
 */
class MessageReadService extends Service
{
	use MessageServiceTrait;

	/**
	 * Mark messages as read up to a specific message ID.
	 *
	 * @param int $conversationId
	 * @param int|null $messageId
	 * @param int|null $userId
	 * @return object
	 */
	public function markAsRead(int $conversationId, ?int $messageId = null, ?int $userId = null): object
	{
		if (!$conversationId)
		{
			return $this->error('Conversation ID required');
		}

		// Get user ID from session if not provided
		$userId = $userId ?? session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('User not authenticated');
		}

		// Find the last message if no message ID was sent
		if ($messageId === null)
		{
			$messageId = $this->getLatestMessageId($conversationId);
			if (!$messageId)
			{
				return $this->error('No messages found in conversation');
			}
		}

		// Update the participant's last read position
		$result = ConversationParticipant::updateLastRead($conversationId, $userId, $messageId);
		if ($result === null)
		{
			return $this->response([
				'success' => true,
				'message' => 'Messages already marked as read'
			]);
		}

		// Update conversation timestamp and notify participants
		$this->touchConversation($conversationId);
		$this->notifyConversationParticipants($conversationId, $messageId, false);

		return $this->response([
			'success' => $result,
			'message' => $result ? 'Messages marked as read' : 'Failed to mark messages as read'
		]);
	}

	/**
	 * Get the latest message ID for a conversation.
	 *
	 * @param int $conversationId
	 * @return int|null
	 */
	protected function getLatestMessageId(int $conversationId): ?int
	{
		$latestMessage = Message::find()
			->where(['m.conversation_id', $conversationId])
			->orderBy('m.id DESC')
			->first();

		return $latestMessage?->id ?? null;
	}

	/**
	 * Get the count of unread messages for a conversation.
	 *
	 * @param int $conversationId
	 * @param int|null $userId
	 * @return int
	 */
	public function getUnreadCount(int $conversationId, ?int $userId = null): int
	{
		$userId = $userId ?? session()->user->id ?? null;
		if (!$userId)
		{
			return 0;
		}

		$participant = ConversationParticipant::getBy([
			'cp.conversation_id' => $conversationId,
			'cp.user_id' => $userId
		]);

		$table = Message::builder();
		$sql = $table->select([['COUNT(*)'], 'count']);

		if (!$participant || !$participant->lastReadMessageId)
		{
			$sql->where(
				['m.conversation_id', $conversationId],
				'm.deleted_at IS NULL'
			);
		}
		else
		{
			$sql->where(
				['m.conversation_id', $conversationId],
				['m.id', '>', $participant->lastReadMessageId],
				'm.deleted_at IS NULL'
			);
		}

		$count = $sql->first();
		return (int)($count->count ?? 0);
	}
}
