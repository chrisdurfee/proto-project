<?php declare(strict_types=1);
namespace Modules\Assistant\Services;

use Common\Services\Service;
use Common\Services\OpenAi\Chat\ChatService;
use Modules\Assistant\Models\AssistantMessage;
use Modules\Assistant\Services\Traits\ManagesAssistantMessages;
use Proto\Http\Router\StreamResponse;

/**
 * AssistantStreamService
 *
 * Handles streaming AI responses via Server-Sent Events.
 *
 * @package Modules\Assistant\Services
 */
class AssistantStreamService extends Service
{
	use ManagesAssistantMessages;

	/**
	 * AssistantStreamService constructor.
	 *
	 * @param ChatService $chatService
	 * @param StreamResponse $streamResponse
	 */
	public function __construct(
		protected ChatService $chatService = new ChatService(),
		protected StreamResponse $streamResponse = new StreamResponse()
	)
	{
	}

	/**
	 * Generate AI response with streaming.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return void
	 */
	public function generate(int $conversationId, int $userId): void
	{
		$this->setupStream();

		$aiMessageId = $this->createAiMessagePlaceholder($conversationId, $userId);
		if (!$aiMessageId)
		{
			$this->sendError('Failed to create AI message');
			return;
		}

		$this->sendInitialMessage($aiMessageId);

		$history = AssistantMessage::getConversationHistory($conversationId, 6);

		if ($this->hasOpenAiKey())
		{
			$this->streamOpenAiResponse($conversationId, $aiMessageId, $history);
		}
		else
		{
			$this->streamTestResponse($conversationId, $aiMessageId);
		}

		$this->closeStream();
	}

	/**
	 * Set up the SSE stream headers.
	 *
	 * @return void
	 */
	protected function setupStream(): void
	{
		$this->streamResponse->sendHeaders(200);
	}

	/**
	 * Send error message and close stream.
	 *
	 * @param string $message
	 * @return void
	 */
	protected function sendError(string $message): void
	{
		$this->streamResponse->sendEvent(json_encode(['error' => $message]));
		$this->closeStream();
	}

	/**
	 * Send initial streaming message with messageId.
	 *
	 * @param int $messageId
	 * @return void
	 */
	protected function sendInitialMessage(int $messageId): void
	{
		$this->streamResponse->sendEvent(json_encode([
			'messageId' => $messageId,
			'status' => 'streaming'
		]));
	}

	/**
	 * Check if OpenAI API key is configured.
	 *
	 * @return bool
	 */
	protected function hasOpenAiKey(): bool
	{
		return !empty(env('apis')->openAi->key);
	}

	/**
	 * Stream a test response when OpenAI is not configured.
	 *
	 * @param int $conversationId
	 * @param int $aiMessageId
	 * @return void
	 */
	protected function streamTestResponse(int $conversationId, int $aiMessageId): void
	{
		$testContent = "I'm a test AI assistant response. OpenAI API key is not configured yet, but the streaming infrastructure is working correctly!";
		$words = explode(' ', $testContent);
		$fullResponse = '';

		foreach ($words as $word)
		{
			if (connection_aborted())
			{
				break;
			}

			$fullResponse .= $word . ' ';
			$this->streamResponse->sendEvent(json_encode([
				'content' => $fullResponse,
				'delta' => $word . ' '
			]));

			usleep(100000); // 100ms delay to simulate streaming
		}

		$this->finalizeAiMessage($conversationId, $aiMessageId, trim($fullResponse));
	}

	/**
	 * Stream response from OpenAI.
	 *
	 * @param int $conversationId
	 * @param int $aiMessageId
	 * @param array $history
	 * @return void
	 */
	protected function streamOpenAiResponse(int $conversationId, int $aiMessageId, array $history): void
	{
		$fullResponse = '';

		try
		{
			$this->chatService->stream(
				$history,
				'AssistantChat',
				null,
				null,
				function($chunk) use (&$fullResponse, $aiMessageId, $conversationId)
				{
					$this->handleStreamChunk($chunk, $aiMessageId, $conversationId, $fullResponse);
				}
			);

			$this->finalizeAiMessage($conversationId, $aiMessageId, $fullResponse);
		}
		catch (\Exception $e)
		{
			$this->handleStreamError($e, $aiMessageId);
		}
	}

	/**
	 * Handle a single stream chunk from OpenAI.
	 *
	 * @param string $chunk
	 * @param int $aiMessageId
	 * @param int $conversationId
	 * @param string &$fullResponse
	 * @return void
	 */
	protected function handleStreamChunk(string $chunk, int $aiMessageId, int $conversationId, string &$fullResponse): void
	{
		if (connection_aborted())
		{
			return;
		}

		$responses = explode("\n\ndata:", $chunk);
		foreach ($responses as $response)
		{
			$clean = preg_replace("/^data: |\\n\\n$/", "", $response);

			if (strpos($clean, "[DONE]") !== false)
			{
				return;
			}

			$result = json_decode($clean);
			if (isset($result->choices[0]->delta->content))
			{
				$fullResponse .= $result->choices[0]->delta->content;
				$this->updateMessagePeriodically($aiMessageId, $fullResponse);
			}
		}
	}

	/**
	 * Update message content periodically (every 5 chunks).
	 *
	 * @param int $aiMessageId
	 * @param string $content
	 * @return void
	 */
	protected function updateMessagePeriodically(int $aiMessageId, string $content): void
	{
		static $chunkCount = 0;
		if (++$chunkCount % 5 === 0)
		{
			$this->updateAiMessage($aiMessageId, $content);
		}
	}

	/**
	 * Handle streaming error.
	 *
	 * @param \Exception $e
	 * @param int $aiMessageId
	 * @return void
	 */
	protected function handleStreamError(\Exception $e, int $aiMessageId): void
	{
		$this->streamResponse->sendEvent(json_encode(['error' => $e->getMessage()]));

		AssistantMessage::edit((object)[
			'id' => $aiMessageId,
			'isStreaming' => 0,
			'isComplete' => 1,
			'content' => 'Error: ' . $e->getMessage(),
			'updatedAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * Close the SSE stream.
	 *
	 * @return void
	 */
	protected function closeStream(): void
	{
		echo "data: [DONE]\n\n";
		flush();
	}
}
