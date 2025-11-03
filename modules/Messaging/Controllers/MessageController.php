<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

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
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		$data = $this->getRequestItem($request);
		$conversationId = (int)$request->params()->conversationId ?? null;

		// Check if we have either content or files
		$hasFiles = !empty($_FILES['attachments']) && !empty($_FILES['attachments']['name']);
		$hasContent = !empty($data->content);

		if (empty($conversationId) || (!$hasContent && !$hasFiles))
		{
			return $this->error('Conversation ID and either content or attachments are required', 400);
		}

		// Set sender and defaults
		$data->senderId = $userId;
		$data->type = $data->type ?? 'text';
		$data->conversationId = $conversationId;

		// Allow empty content if files are present
		if (!$hasContent && $hasFiles)
		{
			$data->content = '';
		}

		$result = $this->addItem($data);
		if ($result->success === false)
		{
			return $result;
		}

		// Handle file attachments if present
		if ($hasFiles)
		{
			$attachmentService = new MessageAttachmentService();
			$attachmentService->handleAttachments($request, $result->id);
		}

		// Update conversation's last message
		$this->updateConversationLastMessage($conversationId, $result->id);

		return $result;
	}

	/**
	 * Mark messages as read.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function markAsRead(Request $request): object
	{
		$conversationId = $request->getInt('conversationId');
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		if (!$conversationId)
		{
			return $this->error('Conversation ID required', 400);
		}

		$result = Message::markAsRead($conversationId, $userId);

		return $this->response([
			'success' => $result,
			'message' => $result ? 'Messages marked as read' : 'Failed to mark messages as read'
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
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		$messageId = (int)$this->getResourceId($request);
		if (!$messageId)
		{
			return $this->error('Message ID is required', 400);
		}

		$message = Message::get($messageId);
		if (!$message)
		{
			return $this->error('Message not found', 404);
		}

		// Only sender can delete their message
		if ($message->senderId != $userId)
		{
			return $this->error('You can only delete your own messages', 403);
		}

		// Soft delete
		$message->deletedAt = date('Y-m-d H:i:s');
		$message->save();

		return $this->response([
			'success' => true,
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
		Conversation::edit((object)[
			'id' => $conversationId,
			'lastMessageId' => $messageId,
			'lastMessageAt' => date('Y-m-d H:i:s')
		]);
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
				return json_encode([
					'messages' => $messages,
					'lastId' => end($messages)->id
				]);
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

		// Check if user has access to this conversation
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return;
		}

		$lastSync = null;
		$INTERVAL_IN_SECONDS = 5; // Check every 5 seconds

		serverEvent($INTERVAL_IN_SECONDS, function() use($conversationId, &$lastSync)
		{
			$response = Message::sync($conversationId, $lastSync);

			/**
			 * This will update the last sync for the next check.
			 */
			$lastSync = date('Y-m-d H:i:s');

			/**
			 * Only return data if there are changes.
			 */
			$hasChanges = !empty($response['new']) || !empty($response['updated']) || !empty($response['deleted']);
			return $hasChanges ? $response : null;
		});
	}
}