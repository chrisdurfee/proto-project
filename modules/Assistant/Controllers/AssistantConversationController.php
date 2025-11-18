<?php declare(strict_types=1);
namespace Modules\Assistant\Controllers;

use Modules\Assistant\Auth\Policies\AssistantConversationPolicy;
use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Services\AssistantService;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * AssistantConversationController
 *
 * @package Modules\Assistant\Controllers
 */
class AssistantConversationController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = AssistantConversationPolicy::class;

	/**
	 * Constructor
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = AssistantConversation::class
	)
	{
		parent::__construct();
	}

	/**
	 * Get or create the active conversation for the current user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function getActive(Request $request): object
	{
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		$assistantService = new AssistantService();
		$conversation = $assistantService->getOrCreateConversation($userId);

		if (!$conversation)
		{
			return $this->error('Failed to get or create conversation', 500);
		}

		return $this->response($conversation);
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
		$userId = session()->user->id ?? null;
		if ($userId)
		{
			$filter->{'ac.user_id'} = $userId;
		}

		return $filter;
	}

	/**
	 * Sync conversations via Redis-based SSE.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return;
		}

		// Subscribe to user's conversation updates channel
		$channel = "assistant_user:{$userId}:conversations";
		redisEvent($channel, function($channel, $message) use ($userId): array|null
		{
			// Message contains conversation ID from Redis publish
			$conversationId = $message['id'] ?? $message['conversationId'] ?? null;
			if (!$conversationId)
			{
				return null;
			}

			$action = $message['action'] ?? 'merge';
			if ($action === 'delete')
			{
				return [
					'merge' => [],
					'deleted' => [$conversationId]
				];
			}

			// Fetch the updated conversation data
			$conversationData = AssistantConversation::get($conversationId);
			if (!$conversationData)
			{
				return null;
			}

			// Verify this conversation belongs to this user
			if ($conversationData->userId != $userId)
			{
				return null;
			}

			return [
				'merge' => [$conversationData],
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
			'title' => 'string:255',
			'description' => 'string'
		];
	}
}
