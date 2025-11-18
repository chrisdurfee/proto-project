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
			return;
		}

		// Update conversation last message
		AssistantConversation::updateLastMessage(
			$conversationId,
			(int)$model->id,
			$content
		);

		// Publish user message to Redis for real-time updates
		$this->publishMessage($conversationId, (int)$model->id);

		// Create placeholder for AI response
        $aiModel = new AssistantMessage(((object)[
			'conversationId' => $conversationId,
			'userId' => $userId,
			'role' => 'assistant',
			'content' => '',
			'type' => 'text',
			'isStreaming' => 1,
			'isComplete' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		]));
		$aiResult = $aiModel->add();
		if (!$aiResult)
		{
			return;
		}

		$aiMessageId = (int)$aiModel->id;

		// Publish AI message creation
		$this->publishMessage($conversationId, $aiMessageId);

		// Get conversation history for context
		$history = AssistantMessage::getConversationHistory($conversationId, 10);

		// Stream the AI response
		$fullResponse = '';
		$this->chatService->stream(
			$history,
			'assistant',
			null,
			null,
			function($chunk) use ($conversationId, $aiMessageId, &$fullResponse)
			{
				// Parse the streaming chunk
				if (strpos($chunk, 'data: ') === 0)
				{
					$data = trim(substr($chunk, 6));
					if ($data === '[DONE]')
					{
						// Mark message as complete
						AssistantMessage::edit((object)[
							'id' => $aiMessageId,
							'isStreaming' => 0,
							'isComplete' => 1,
							'updatedAt' => date('Y-m-d H:i:s')
						]);

						// Update conversation last message
						AssistantConversation::updateLastMessage(
							$conversationId,
							$aiMessageId,
							$fullResponse
						);

						// Publish final update
						$this->publishMessage($conversationId, $aiMessageId);
						return;
					}

					$json = json_decode($data);
					if (isset($json->choices[0]->delta->content))
					{
						$content = $json->choices[0]->delta->content;
						$fullResponse .= $content;

						// Update the message in the database
						AssistantMessage::edit((object)[
							'id' => $aiMessageId,
							'content' => $fullResponse,
							'updatedAt' => date('Y-m-d H:i:s')
						]);

						// Publish update to Redis for real-time sync
						$this->publishMessage($conversationId, $aiMessageId);
					}
				}
			}
		);
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
