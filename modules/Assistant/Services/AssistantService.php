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
	 * Generate AI response with streaming.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return void
	 */
	public function generateWithStreaming(int $conversationId, int $userId): void
	{
		// Use Proto's StreamResponse to set up SSE properly
		$response = new \Proto\Http\Router\StreamResponse();
		$response->sendHeaders(200);

		// Create AI message placeholder
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

		$aiResult = $aiModel->add();
		if (!$aiResult)
		{
			$response->sendEvent(json_encode(['error' => 'Failed to create AI message']));
			return;
		}

		$aiMessageId = (int)$aiModel->id;
		$fullResponse = '';

		// Send initial message with messageId
		$response->sendEvent(json_encode(['messageId' => $aiMessageId, 'status' => 'streaming']));

		// Get conversation history
		$history = AssistantMessage::getConversationHistory($conversationId, 10);

		// Check if OpenAI API key is configured
		$openAiKey = env('openAi.apiKey') ?? null;

		if (!$openAiKey) {
			// Test mode - send fake streaming content
			$testContent = "I'm a test AI assistant response. OpenAI API key is not configured yet, but the streaming infrastructure is working correctly!";
			$words = explode(' ', $testContent);

			foreach ($words as $word) {
				$fullResponse .= $word . ' ';
				$response->sendEvent(json_encode([
					'content' => $fullResponse,
					'delta' => $word . ' '
				]));

				// Small delay to simulate streaming
				usleep(100000); // 100ms

				if (connection_aborted()) {
					break;
				}
			}

			// Update final message
			AssistantMessage::edit((object)[
				'id' => $aiMessageId,
				'isStreaming' => 0,
				'isComplete' => 1,
				'content' => trim($fullResponse),
				'updatedAt' => date('Y-m-d H:i:s')
			]);

			AssistantConversation::updateLastMessage($conversationId, $aiMessageId, trim($fullResponse));

			echo "data: [DONE]\n\n";
			flush();
			return;
		}

		try {
			// Stream from OpenAI using ChatService
			// ChatService->stream() uses Message class for SSE output (data is already formatted)
			$this->chatService->stream(
				$history,
				'assistant',
				null,
				null, // No event object - ChatService uses Message class directly
				function($chunk) use (&$fullResponse, $aiMessageId, $conversationId)
				{
					if (connection_aborted()) {
						return;
					}

					// Parse chunk to update database
					$responses = explode("\n\ndata:", $chunk);
					foreach ($responses as $response)
					{
						$clean = preg_replace("/^data: |\\n\\n$/", "", $response);

						if (strpos($clean, "[DONE]") !== false)
						{
							// Mark complete
							AssistantMessage::edit((object)[
								'id' => $aiMessageId,
								'isStreaming' => 0,
								'isComplete' => 1,
								'content' => $fullResponse,
								'updatedAt' => date('Y-m-d H:i:s')
							]);

							AssistantConversation::updateLastMessage($conversationId, $aiMessageId, $fullResponse);
							return;
						}

						$result = json_decode($clean);
						if (isset($result->choices[0]->delta->content))
						{
							$fullResponse .= $result->choices[0]->delta->content;

							// Update database every few chunks
							static $chunkCount = 0;
							if (++$chunkCount % 5 === 0) {
								AssistantMessage::edit((object)[
									'id' => $aiMessageId,
									'content' => $fullResponse,
									'updatedAt' => date('Y-m-d H:i:s')
								]);
							}
						}
					}
				}
			);
		} catch (\Exception $e) {
			// Send error and mark message as complete
			$response->sendEvent(json_encode(['error' => $e->getMessage()]));

			AssistantMessage::edit((object)[
				'id' => $aiMessageId,
				'isStreaming' => 0,
				'isComplete' => 1,
				'content' => 'Error: ' . $e->getMessage(),
				'updatedAt' => date('Y-m-d H:i:s')
			]);
		}

		// Always send [DONE] to close the stream
		echo "data: [DONE]\n\n";
		flush();
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
