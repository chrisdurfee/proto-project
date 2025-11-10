<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Modules\Messaging\Auth\Policies\MessagePolicy;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\ConversationParticipant;
use Modules\Messaging\Services\MessageAttachmentService;

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

		if (!$this->validateMessageInput($conversationId, $data))
		{
			return $this->error('Conversation ID and either content or attachments are required', 400);
		}

		$this->prepareMessageData($data, $conversationId);

		$result = $this->addItem($data);
		if ($result->success === false)
		{
			return $result;
		}

		$this->processAttachments($request, $result->id);
		$this->updateConversationLastMessage($conversationId, $result->id);

		return $result;
	}

	/**
	 * Validate that the message has required data.
	 *
	 * @param int|null $conversationId
	 * @param object $data
	 * @return bool
	 */
	protected function validateMessageInput(?int $conversationId, object $data): bool
	{
		if (empty($conversationId))
		{
			return false;
		}

		$hasFiles = $this->hasAttachments();
		$hasContent = !empty($data->content);

		return $hasContent || $hasFiles;
	}

	/**
	 * Check if the request has file attachments.
	 *
	 * @return bool
	 */
	protected function hasAttachments(): bool
	{
		return !empty($_FILES['attachments']) && !empty($_FILES['attachments']['name']);
	}

	/**
	 * Prepare message data for creation.
	 *
	 * @param object $data
	 * @param int $conversationId
	 * @return void
	 */
	protected function prepareMessageData(object $data, int $conversationId): void
	{
		$data->senderId = session()->user->id ?? null;
		$data->type = $data->type ?? 'text';
		$data->conversationId = $conversationId;

		// Decode URL-encoded content (happens with multipart/form-data)
		if (!empty($data->content))
		{
			$data->content = urldecode($data->content);
		}
		// Allow empty content if files are present
		else if ($this->hasAttachments())
		{
			$data->content = '';
		}
	}

	/**
	 * Process and attach files to the message.
	 *
	 * @param Request $request
	 * @param int $messageId
	 * @return void
	 */
	protected function processAttachments(Request $request, int $messageId): void
	{
		if (!$this->hasAttachments())
		{
			return;
		}

		$attachmentService = new MessageAttachmentService();
		$attachmentService->handleAttachments($request, $messageId);
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
		if (!$conversationId)
		{
			return $this->error('Conversation ID required', 400);
		}

		$userId = session()->user->id ?? null;
		$data = $this->getRequestItem($request);
		$messageId = isset($data->messageId) ? (int)$data->messageId : null;
		if ($messageId === null)
		{
			$latestMessage = Message::find()
				->where(['m.conversation_id', $conversationId])
				->orderBy('m.id DESC')
				->first();

			if (!$latestMessage)
			{
				return $this->error('No messages found in conversation', 404);
			}

			$messageId = $latestMessage->id;
		}

		/**
		 * This will touch the conversation to update its last modified timestamp.
		 */
		Conversation::edit((object)[
			'id' => $conversationId
		]);

		// Update the participant's last read position
		$result = ConversationParticipant::updateLastRead($conversationId, $userId, $messageId);

		return $this->response([
			'success' => $result,
			'message' => $result ? 'Messages marked as read' : 'Failed to mark messages as read'
		]);
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

		$userId = session()->user->id ?? null;
		$participant = ConversationParticipant::getBy([
			'cp.conversation_id' => $conversationId,
			'cp.user_id' => $userId
		]);

		$table = (new Message())->storage->table();
		$sql = $table->select([['COUNT(*)'], 'count']);
		if (!$participant || !$participant->lastReadMessageId)
		{
			$sql
				->where(
					['m.conversation_id', $conversationId],
					'm.deleted_at IS NULL'
				);
		}
		else
		{
			$sql
				->where(
					['m.conversation_id', $conversationId],
					['m.id', '>', $participant->lastReadMessageId],
					'm.deleted_at IS NULL'
				);
		}

		$count = $sql->first();

		return $this->response([
			'count' => $count->count ?? 0
		]);
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
			$filter->conversationId = $conversationId;
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
	 * Modifies the modifiers array to add custom SQL conditions.
	 *
	 * @param array $modifiers
	 * @param Request $request
	 * @return array
	 */
	protected function modifyModifiers(array $modifiers, Request $request): array
	{
		// Filter out soft-deleted messages by default using the model's table alias
		$modifiers[] = 'm.deleted_at IS NULL';
		return $modifiers;
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
		$success = Message::remove((object)[
			'id' => $messageId
		]);

		return $this->response([
			'success' => $success,
			'messageId' => $messageId
		]);
	}

	/**
	 * Update the conversation's last message reference.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @return void
	 */
	protected function updateConversationLastMessage(int $conversationId, int $messageId): void
	{
		// Get the message to extract content and type
		$message = Message::get($messageId);
		if ($message)
		{
			Conversation::updateLastMessage(
				$conversationId,
				$messageId,
				$message->content,
				$message->type ?? 'text'
			);
		}
		else
		{
			// Fallback to just updating the ID and timestamp
			Conversation::edit((object)[
				'id' => $conversationId,
				'lastMessageId' => $messageId,
				'lastMessageAt' => date('Y-m-d H:i:s')
			]);
		}
	}

	/**
	 * Validation rules
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
	 * Sync messages for a conversation since the last sync time.
	 * Uses Server-Sent Events (SSE) to stream updates.
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

		$lastSync = date('Y-m-d H:i:s');
		$INTERVAL_IN_SECONDS = 5;
		$firstSync = true;

		serverEvent($INTERVAL_IN_SECONDS, function() use($conversationId, &$lastSync, &$firstSync)
		{
			$previousSync = $lastSync;
			/**
			 * Update the last sync timestamp for the next check.
			 */
			$lastSync = date('Y-m-d H:i:s');
			$response = Message::sync($conversationId, $previousSync);

			if ($firstSync)
			{
				$firstSync = false;
				return $response;
			}

			$hasChanges = !empty($response['merge']) || !empty($response['deleted']);
			return $hasChanges ? $response : null;
		});
	}
}