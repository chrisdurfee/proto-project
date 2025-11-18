<?php declare(strict_types=1);
namespace Modules\Assistant\Controllers;

use Modules\Assistant\Auth\Policies\AssistantMessagePolicy;
use Modules\Assistant\Models\AssistantMessage;
use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Services\AssistantService;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * AssistantMessageController
 *
 * @package Modules\Assistant\Controllers
 */
class AssistantMessageController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = AssistantMessagePolicy::class;

	/**
	 * Constructor
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = AssistantMessage::class
	)
	{
		parent::__construct();
	}

	/**
	 * Send a new user message (no AI streaming here).
	 *
	 * @param Request $request
	 * @return object
	 */
	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		$conversationId = (int)($request->params()->conversationId ?? $data->conversationId ?? null);
		$userId = session()->user->id ?? null;

		if (!$conversationId || !$userId)
		{
			return $this->error('Conversation ID and user ID required', 400);
		}

		$content = $data->content ?? '';
		if (empty(trim($content)))
		{
			return $this->error('Message content required', 400);
		}

		// Create user message only
		$result = $this->addItem((object)[
			'conversationId' => $conversationId,
			'userId' => $userId,
			'role' => 'user',
			'content' => $content,
			'type' => 'text',
			'isComplete' => 1
		]);

		if (!$result)
		{
			return $this->error('Failed to create message', 500);
		}

		$messageId = (int)$result->id;

		// Update conversation last message
		AssistantConversation::updateLastMessage($conversationId, $messageId, $content);

		// Publish to Redis for sync
		events()->emit("redis:assistant_conversation:{$conversationId}:messages", [
			'id' => $messageId,
			'action' => 'merge'
		]);

		return $this->response(['success' => true, 'id' => $messageId]);
	}

	/**
	 * Generate AI response with streaming.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function generate(Request $request): void
	{
		$conversationId = (int)($request->params()->conversationId ?? $request->getInt('conversationId') ?? null);
		$userId = session()->user->id ?? null;
		if (!$conversationId || !$userId)
		{
			return;
		}

		$assistantService = new AssistantService();
		eventStream(function() use ($conversationId, $userId, $assistantService)
		{
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
				return null;
			}

			$aiMessageId = (int)$aiModel->id;
			$fullResponse = '';

			// Get conversation history
			$history = AssistantMessage::getConversationHistory($conversationId, 10);

			// Stream from OpenAI
			return $assistantService->getChatService()->stream(
				$history,
				'assistant',
				null,
				null,
				function($chunk) use (&$fullResponse, $aiMessageId, $conversationId)
				{
					$responses = explode("\n\ndata:", $chunk);
					foreach ($responses as $response)
					{
						$clean = preg_replace("/^data: |\n\n$/", "", $response);

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
							return ['finish_reason' => 'stop'];
						}

						$result = json_decode($clean);
						if (isset($result->choices[0]->delta->content))
						{
							$fullResponse .= $result->choices[0]->delta->content;

							// Update database periodically
							AssistantMessage::edit((object)[
								'id' => $aiMessageId,
								'content' => $fullResponse,
								'updatedAt' => date('Y-m-d H:i:s')
							]);

							// Return chunk to frontend
							return $result;
						}
					}

					return null;
				}
			);
		});
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
			$filter->{'am.conversation_id'} = $conversationId;
		}

		// Only show messages for the authenticated user's conversations
		$userId = session()->user->id ?? null;
		if ($userId)
		{
			$filter->{'am.user_id'} = $userId;
		}

		// Support "since" parameter for fetching newer messages
		$since = $request->getInt('since');
		if ($since)
		{
			$filter->{'am.id'} = ['>', $since];
		}

		return $filter;
	}

	/**
	 * Sync messages for a conversation via Redis-based SSE.
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
		$channel = "assistant_conversation:{$conversationId}:messages";
		redisEvent($channel, function($channel, $message): array|null
		{
			// Message contains message ID from Redis publish
			$messageId = $message['id'] ?? $message['messageId'] ?? null;
			if (!$messageId)
			{
				return null;
			}

			$action = $message['action'] ?? 'merge';
			if ($action === 'delete')
			{
				return [
					'merge' => [],
					'deleted' => [$messageId]
				];
			}

			// Fetch the updated message data
			$messageData = AssistantMessage::get($messageId);
			if (!$messageData)
			{
				return null;
			}

			// Only sync user messages (AI messages are handled by streaming)
			if ($messageData->role !== 'user')
			{
				return null;
			}

			return [
				'merge' => [$messageData],
				'deleted' => []
			];
		});
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
			'content' => 'string|required'
		];
	}
}
