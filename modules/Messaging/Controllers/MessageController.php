<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Modules\Messaging\Auth\Policies\MessagePolicy;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Models\ConversationParticipant;
use Modules\Messaging\Services\MessageService;
use Modules\Messaging\Services\MessageReadService;
use Modules\Messaging\Services\MessageDeleteService;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * MessageController
 *
 * @package Modules\Messaging\Controllers
 */
class MessageController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = MessagePolicy::class;

	/**
	 * Constructor
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = Message::class
	)
	{
		parent::__construct();
	}

	/**
	 * Send a new message.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		$conversationId = (int)$request->params()->conversationId ?? null;

		$messageService = new MessageService();
		return $messageService->createMessage($conversationId, $data, $request);
	}

	/**
	 * Mark messages as read up to a specific message ID.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function markAsRead(Request $request): object
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		$data = $this->getRequestItem($request);
		$messageId = isset($data->messageId) ? (int)$data->messageId : null;

		$readService = new MessageReadService();
		return $readService->markAsRead($conversationId, $messageId);
	}

	/**
	 * Get the count of unread messages for a conversation.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function getUnreadCount(Request $request): object
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return $this->error('Conversation ID required', 400);
		}

		$readService = new MessageReadService();
		$count = $readService->getUnreadCount($conversationId);

		return $this->response(['count' => $count]);
	}

	/**
	 * Modifies the filter object based on the request.
	 *
	 * @param mixed $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		$conversationId = $request->params()->conversationId ?? null;
		if (isset($conversationId))
		{
			$filter->{'m.conversation_id'} = $conversationId;
		}

		// Support "since" parameter for fetching newer messages
		$since = $request->getInt('since');
		if ($since)
		{
			$filter->{'m.id'} = ['>', $since];
		}

		return $filter;
	}

	/**
	 * Delete (soft delete) a message.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function delete(Request $request): object
	{
		$messageId = (int)$this->getResourceId($request);
		$conversationId = (int)$request->params()->conversationId ?? null;

		$deleteService = new MessageDeleteService();
		return $deleteService->deleteMessage($messageId, $conversationId);
	}

	/**
	 * Validation rules
	 *
	 * @return array
	 */
	protected function validate(): array
	{
		return [
			'conversationId' => 'int|required',
			'content' => 'string', // Optional - can be empty if attachments are present
			'type' => 'string:20',
			'fileUrl' => 'string:500',
			'fileName' => 'string:255'
		];
	}

	/**
	 * Stream new messages for a conversation via SSE.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function stream(Request $request): void
	{
		$conversationId = $request->params()->conversationId ?? null;
		if (!$conversationId)
		{
			return;
		}

		$lastId = $request->getInt('lastId') ?? 0;

		// Use SSE to stream new messages
		eventStream(function() use ($conversationId, $lastId)
		{
			$messages = Message::fetchWhere([
				['conversationId', $conversationId],
				['id', '>', $lastId]
			]);

			if (!empty($messages))
			{
				return [
					'messages' => $messages,
					'lastId' => end($messages)->id
				];
			}

			return null;
		});
	}

	/**
	 * Find participants in a conversation based on messages.
	 *
	 * @param int $conversationId
	 * @return array
	 */
	protected function findParticipants(int $conversationId): array
	{
		$conversation = ConversationParticipant::getBy([
			'cp.conversationId' => $conversationId
		]);

		if (!$conversation)
		{
			return [];
		}

		return $this->getOtherParticipants(
			$conversation->participants,
			session()->user->id ?? 0
		);
	}

	/**
	 * Get other participants excluding the current user.
	 *
	 * @param array $participants
	 * @param int $currentUserId
	 * @return array
	 */
	protected function getOtherParticipants(array $participants, int $currentUserId): array
	{
		$rows = [];
		foreach ($participants as $participant)
		{
			if ($participant->userId == $currentUserId)
			{
				continue;
			}

			$rows[] = (object)$participant;
		}

		return $rows;
	}

	/**
	 * Get Redis channels for conversation participants.
	 *
	 * @param int $conversationId
	 * @return array
	 */
	protected function getParticipantChannels(int $conversationId): array
	{
		$participants = $this->findParticipants($conversationId);
		if (empty($participants))
		{
			return [];
		}

		if (count($participants) === 1)
		{
			$participant = $participants[0];
			return ["user:{$participant->userId}:status"];
		}
		else
		{
			// For group conversations, return all participant channels
			$channels = [];
			foreach ($participants as $participant)
			{
				$channels[] = "user:{$participant->userId}:status";
			}
			return $channels;
		}
	}

	/**
	 * Sync messages for a conversation via Redis-based Server-Sent Events.
	 * Listens to message updates published via Redis pub/sub.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return;
		}

		// Subscribe to conversation's message updates channel
		$channels = [
			"conversation:{$conversationId}:messages"
		];

		/**
		 * Also listen to participant status channels
		 */
		$participantChannels = $this->getParticipantChannels($conversationId);
		if (!empty($participantChannels))
		{
			$channels = array_merge($participantChannels, $channels);
		}

		redisEvent($channels, function($channel, $message): array|null
		{
			/**
			 * pass the user status update.
			 */
			if (strpos($channel, 'user:') !== false)
			{
				return [
					'userStatus' => [
						[
							'status' => $message->status,
							'userId' => $message->id
						]
					]
				];
			}

			/**
			 * pass the newly updated or deleted message.
			 */
			$messageId = $message['id'] ?? $message['messageId'] ?? null;
			if (!$messageId)
			{
				return null;
			}

			// Determine if it's a delete or update action
			$action = $message['action'] ?? 'merge';
			if ($action === 'delete')
			{
				return [
					'merge' => [],
					'deleted' => [$messageId]
				];
			}

			// We need to fetch the full message data
			$messageData = Message::get($messageId);
			if (!$messageData)
			{
				return null;
			}

			return [
				'merge' => [$messageData],
				'deleted' => []
			];
		});
	}
}