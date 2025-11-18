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
		$userId = (int)auth()->user->id();
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
		// Only show conversations for the authenticated user
		$userId = auth()->user->id();
		if ($userId)
		{
			$filter->{'ac.user_id'} = $userId;
		}

		return $filter;
	}

	/**
	 * Sync conversations via SSE.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$userId = (int)auth()->user->id();
		if (!$userId)
		{
			return;
		}

		$lastSync = $request->get('lastSync');

		// Use SSE to stream conversation updates
		eventStream(function() use ($userId, $lastSync)
		{
			$data = AssistantConversation::sync($userId, $lastSync);
			return $data;
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
