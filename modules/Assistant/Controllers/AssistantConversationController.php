<?php declare(strict_types=1);
namespace Modules\Assistant\Controllers;

use Modules\Assistant\Auth\Policies\AssistantConversationPolicy;
use Modules\Assistant\Models\AssistantConversation;
use Modules\Assistant\Services\AssistantService;
use Proto\Controllers\ResourceController;
use Proto\Controllers\Traits\SyncableTrait;
use Proto\Http\Router\Request;

/**
 * AssistantConversationController
 *
 * @package Modules\Assistant\Controllers
 */
class AssistantConversationController extends ResourceController
{
	use SyncableTrait;

	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = AssistantConversationPolicy::class;

	/**
	 * @var bool $scopeToUser
	 */
	protected bool $scopeToUser = true;

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
		$userId = session()->user->id;

		$assistantService = new AssistantService();
		$conversation = $assistantService->getOrCreateConversation($userId);

		if (!$conversation)
		{
			return $this->error('Failed to get or create conversation', 500);
		}

		return $this->response($conversation);
	}

	/**
	 * Get the Redis channel for conversation sync.
	 *
	 * @param Request $request
	 * @return string
	 */
	protected function getSyncChannel(Request $request): string
	{
		$userId = session()->user->id;
		return "assistant_user:{$userId}:conversations";
	}

	/**
	 * Handle incoming sync message for conversations.
	 *
	 * @param string $channel
	 * @param array $message
	 * @param Request $request
	 * @return array|null|false
	 */
	protected function handleSyncMessage(string $channel, array $message, Request $request): array|null|false
	{
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

		$conversationData = AssistantConversation::get($conversationId);
		if (!$conversationData)
		{
			return null;
		}

		// Verify this conversation belongs to this user
		$userId = session()->user->id;
		if ($conversationData->userId != $userId)
		{
			return null;
		}

		return [
			'merge' => [$conversationData],
			'deleted' => []
		];
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
