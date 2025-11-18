<?php declare(strict_types=1);
namespace Modules\Assistant\Services;

use Common\Services\Service;
use Common\Services\OpenAi\Chat\ChatService;
use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Models\AssistantMessage;

/**
 * AssistantService
 *
 * Handles AI assistant chat interactions using OpenAI.
 *
 * @package Modules\Assistant\Services
 */
class AssistantService extends Service
{
	/**
	 * AssistantService constructor.
	 *
	 * @param ChatService $chatService
	 * @return void
	 */
	public function __construct(
		protected ChatService $chatService = new ChatService()
	)
	{
	}

	/**
	 * Get the chat service instance.
	 *
	 * @return ChatService
	 */
	public function getChatService(): ChatService
	{
		return $this->chatService;
	}

	/**
	 * Get or create a conversation for the user.
	 *
	 * @param int $userId
	 * @return object|null
	 */
	public function getOrCreateConversation(int $userId): ?object
	{
		return AssistantConversation::getOrCreateForUser($userId);
	}

	/**
	 * Create a user message and stream the AI response.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param string $content
	 * @return void
	 */
	public function streamResponse(int $conversationId, int $userId, string $content): void
	{
		$userMessageId = $this->createUserMessage($conversationId, $userId, $content);
		if (!$userMessageId)
		{
			return;
		}

		$aiMessageId = $this->createAiMessagePlaceholder($conversationId, $userId);
		if (!$aiMessageId)
		{
			return;
		}

		$this->streamAiResponse($conversationId, $aiMessageId);
	}

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
	 * Stream the AI response and update the message.
	 *
	 * @param int $conversationId
	 * @param int $aiMessageId
	 * @return void
	 */
	protected function streamAiResponse(int $conversationId, int $aiMessageId): void
	{
		$history = AssistantMessage::getConversationHistory($conversationId, 10);
		$fullResponse = '';

		$this->chatService->stream(
			$history,
			'assistant',
			null,
			null,
			function($chunk) use ($conversationId, $aiMessageId, &$fullResponse)
			{
				$this->handleStreamChunk($chunk, $conversationId, $aiMessageId, $fullResponse);
			}
		);
	}

    /**
	 * Stream the AI response and update the message.
	 *
	 * @param int $conversationId
	 * @param int $aiMessageId
	 * @return void
	 */
	protected function streamReply(int $conversationId): void
	{
		$history = AssistantMessage::getConversationHistory($conversationId, 10);
		$fullResponse = '';

		$this->chatService->stream(
			$history,
			'assistant',
			null,
			null,
			function($chunk) use ($conversationId, &$fullResponse)
			{
				$this->handleStreamChunk($chunk, $conversationId, $aiMessageId, $fullResponse);
			}
		);
	}

	/**
	 * Handle a single stream chunk from the AI service.
	 *
	 * @param string $chunk
	 * @param int $conversationId
	 * @param int $aiMessageId
	 * @param string &$fullResponse
	 * @return void
	 */
	protected function handleStreamChunk(string $chunk, int $conversationId, int $aiMessageId, string &$fullResponse): void
	{
		if (strpos($chunk, 'data: ') !== 0)
		{
			return;
		}

		$data = trim(substr($chunk, 6));
		if ($data === '[DONE]')
		{
			$this->finalizeAiMessage($conversationId, $aiMessageId, $fullResponse);
			return;
		}

		$json = json_decode($data);
		if (!isset($json->choices[0]->delta->content))
		{
			return;
		}

		$content = $json->choices[0]->delta->content;
		$fullResponse .= $content;

		$this->updateAiMessage($aiMessageId, $fullResponse);
		$this->publishMessage($conversationId, $aiMessageId);
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
