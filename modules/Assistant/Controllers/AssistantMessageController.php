<?php declare(strict_types=1);
namespace Modules\Assistant\Controllers;

use Modules\Assistant\Auth\Policies\AssistantMessagePolicy;
use Modules\Assistant\Models\AssistantMessage;
use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Services\AssistantService;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Proto\Http\Router\StreamResponse;

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
	 * Modify the item data before adding.
	 * Sets conversation-specific fields.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifiyAddItem(object &$data, Request $request): void
	{
		$data->conversationId = (int)($request->params()->conversationId ?? $data->conversationId ?? null);
		$data->role = 'user';
		$data->type = 'text';
		$data->isComplete = 1;

		// Sanitize content - trim whitespace and newlines
		if (isset($data->content))
		{
			$data->content = trim($data->content);
		}
	}

	/**
	 * Adds a model item.
	 * Overridden to handle post-creation actions.
	 *
	 * @param object $data
	 * @return object
	 */
	protected function addItem(object $data): object
	{
		$result = parent::addItem($data);

		// Only proceed with post-actions if add was successful
		if (!isset($result->id))
		{
			return $result;
		}

		$messageId = (int)$result->id;
		$this->updateConversationLastMessage($data->conversationId, $messageId, $data->content);
		$this->publishMessageCreated($data->conversationId, $messageId);

		return $result;
	}

	/**
	 * Update the conversation's last message.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @param string $content
	 * @return void
	 */
	protected function updateConversationLastMessage(int $conversationId, int $messageId, string $content): void
	{
		AssistantConversation::updateLastMessage($conversationId, $messageId, $content);
	}

	/**
	 * Publish message created event to Redis.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @return void
	 */
	protected function publishMessageCreated(int $conversationId, int $messageId): void
	{
		events()->emit("redis:assistant_conversation:{$conversationId}:messages", [
			'id' => $messageId,
			'action' => 'merge'
		]);
	}

	/**
	 * Generate AI response with streaming.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function generate(Request $request): void
	{
		$userId = session()->user->id ?? null;
		$conversationId = (int)($request->params()->conversationId ?? $request->getInt('conversationId') ?? null);
		$assistantService = new AssistantService();
		$assistantService->generateWithStreaming($conversationId, $userId);
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
