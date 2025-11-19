<?php declare(strict_types=1);
namespace Modules\Assistant\Services;

use Common\Services\Service;
use Common\Services\OpenAi\Chat\ChatService;
use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Services\Traits\ManagesAssistantMessages;

/**
 * AssistantService
 *
 * Handles AI assistant chat interactions using OpenAI.
 *
 * @package Modules\Assistant\Services
 */
class AssistantService extends Service
{
	use ManagesAssistantMessages;
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

		$this->streamAiResponse($conversationId, $userId);
	}

	/**
	 * Stream the AI response.
	 * Delegates to AssistantStreamService for SSE handling.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return void
	 */
	protected function streamAiResponse(int $conversationId, int $userId): void
	{
		$streamService = new AssistantStreamService($this->chatService);
		$streamService->generate($conversationId, $userId);
	}

	/**
	 * Generate AI response with streaming.
	 * Delegates to AssistantStreamService.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return void
	 */
	public function generateWithStreaming(int $conversationId, int $userId): void
	{
		$streamService = new AssistantStreamService($this->chatService);
		$streamService->generate($conversationId, $userId);
	}
}
