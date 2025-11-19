<?php declare(strict_types=1);
namespace Modules\Assistant\Services\Traits;

use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Models\AssistantMessage;

/**
 * ManagesAssistantMessages
 *
 * Shared functionality for creating and managing assistant messages.
 *
 * @package Modules\Assistant\Services\Traits
 */
trait ManagesAssistantMessages
{
	/**
	 * Create and save a user message.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param string $content
	 * @return int|null The message ID or null on failure
	 */
	protected function createUserMessage(int $conversationId, int $userId, string $content): ?int
	{
		$model = new AssistantMessage((object)[
			'conversationId' => $conversationId,
			'userId' => $userId,
			'role' => 'user',
			'content' => $content,
			'type' => 'text',
			'isComplete' => 1,
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		]);

		$result = $model->add();
		if (!$result)
		{
			return null;
		}

		$messageId = (int)$model->id;
		AssistantConversation::updateLastMessage($conversationId, $messageId, $content);
		$this->publishMessage($conversationId, $messageId);

		return $messageId;
	}

	/**
	 * Create a placeholder message for the AI response.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return int|null The message ID or null on failure
	 */
	protected function createAiMessagePlaceholder(int $conversationId, int $userId): ?int
	{
		$aiModel = new AssistantMessage((object)[
			'conversationId' => $conversationId,
			'userId' => $userId,
			'role' => 'assistant',
			'content' => '',
			'type' => 'text',
			'isStreaming' => 1,
			'isComplete' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		]);

		$result = $aiModel->add();
		if (!$result)
		{
			return null;
		}

		$aiMessageId = (int)$aiModel->id;
		$this->publishMessage($conversationId, $aiMessageId);

		return $aiMessageId;
	}

	/**
	 * Update an AI message with new content.
	 *
	 * @param int $aiMessageId
	 * @param string $content
	 * @return void
	 */
	protected function updateAiMessage(int $aiMessageId, string $content): void
	{
		AssistantMessage::edit((object)[
			'id' => $aiMessageId,
			'content' => $content,
			'updatedAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * Finalize an AI message when streaming is complete.
	 *
	 * @param int $conversationId
	 * @param int $aiMessageId
	 * @param string $fullResponse
	 * @return void
	 */
	protected function finalizeAiMessage(int $conversationId, int $aiMessageId, string $fullResponse): void
	{
		AssistantMessage::edit((object)[
			'id' => $aiMessageId,
			'isStreaming' => 0,
			'isComplete' => 1,
			'content' => $fullResponse,
			'updatedAt' => date('Y-m-d H:i:s')
		]);

		AssistantConversation::updateLastMessage($conversationId, $aiMessageId, $fullResponse);
		$this->publishMessage($conversationId, $aiMessageId);
	}

	/**
	 * Publish a message update to Redis for real-time sync.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @return void
	 */
	protected function publishMessage(int $conversationId, int $messageId): void
	{
		events()->emit("redis:assistant_conversation:{$conversationId}:messages", [
			'id' => $messageId,
			'action' => 'merge'
		]);
	}
}
