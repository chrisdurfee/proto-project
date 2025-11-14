<?php declare(strict_types=1);
namespace Modules\Messaging\Services;

use Common\Services\Service;
use Modules\Messaging\Models\Message;
use Proto\Http\Router\Request;

/**
 * MessageService
 *
 * This service handles message creation and related operations.
 *
 * @package Modules\Messaging\Services
 */
class MessageService extends Service
{
	use MessageServiceTrait;

	/**
	 * Create a new message.
	 *
	 * @param int $conversationId
	 * @param object $data
	 * @param Request $request
	 * @return object
	 */
	public function createMessage(int $conversationId, object $data, Request $request): object
	{
		// Validate input
		if (!$this->validateMessageInput($conversationId, $data))
		{
			return $this->error('Conversation ID and either content or attachments are required');
		}

		// Prepare message data
		$this->prepareMessageData($data, $conversationId);

		// Create the message using model instance to get the ID
		$message = new Message($data);
		$success = $message->add();
		if (!$success)
		{
			return $this->error('Failed to create message');
		}

		$messageId = $message->id;

		// Process attachments if present
		$this->processAttachments($request, $messageId);

		// Update conversation and notify participants
		$this->updateConversationForSync($conversationId, $messageId);

		return $this->response([
			'success' => true,
			'id' => $messageId,
			'message' => 'Message created successfully'
		]);
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

		if (!empty($data->content))
		{
			$data->content = urldecode($data->content);
		}
		else if ($this->hasAttachments())
		{
			$data->content = '';
		}
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
	 * Update conversation data for sync operations.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @return void
	 */
	protected function updateConversationForSync(int $conversationId, int $messageId): void
	{
		$this->updateConversationLastMessage($conversationId, $messageId);
		$this->publishRedisEvent($conversationId, $messageId, 'merge');
		$this->notifyConversationParticipants($conversationId, $messageId, true);
	}
}
