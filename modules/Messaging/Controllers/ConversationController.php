<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Modules\Messaging\Auth\Policies\ConversationPolicy;
use Modules\Messaging\Services\ConversationService;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * ConversationController
 *
 * @package Modules\Messaging\Controllers
 */
class ConversationController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ConversationPolicy::class;

	/**
	 * @var string|null $serviceClass
	 */
	protected ?string $serviceClass = ConversationService::class;

	/**
	 * Constructor
	 *
	 * @param string|null $model
	 */
	public function __construct(
		protected ?string $model = Conversation::class
	)
	{
		parent::__construct();
	}

	/**
	 * Validation rules
	 */
	protected function validate(): array
	{
		return [
			'title' => 'string:255',
			'type' => 'string:20',
			'description' => 'string:500',
			'participantId' => 'int'
		];
	}

	/**
	 * Adds a model item.
	 *
	 * Delegates conversation creation and participant management to ConversationService.
	 *
	 * @param object $data The data to set up the model with.
	 * @return object The response object.
	 */
	protected function addItem(object $data): object
	{
		$data->type ??= 'direct';
		$userId = (int)session()->user->id;
		$participantId = $data->participantId ?? null;

		if ($data->type === 'direct' && $participantId)
		{
			$result = $this->service->createDirectConversation((int)$userId, (int)$participantId);
			if (!$result->success)
			{
				return $this->error($result->error);
			}
			return $this->response($result->data);
		}

		return parent::addItem($data);
	}

	/**
	 * Find existing conversation with a user or create a new one.
	 *
	 * @param Request $request
	 * @return object Response with conversation ID
	 */
	public function findOrCreate(Request $request): object
	{
		$participantId = $request->getInt('participantId');
		if (!is_int($participantId))
		{
			return $this->error('Participant ID required', 400);
		}

		$userId = session()->user->id;
		$result = $this->service->findOrCreate((int)$userId, $participantId);
		if (!$result->success)
		{
			$statusCode = $result->code === 'NOT_FOUND' ? 404 : 200;
			return $this->error($result->error, $statusCode);
		}

		return $this->response($result->data);
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
		$userId = $request->params()->userId ?? null;
		if (isset($userId))
		{
			$filter->{'cp.user_id'} = $userId;
			unset($filter->userId);
		}

		// Support "since" parameter for fetching newer conversations
		$since = $request->getInt('since');
		if ($since)
		{
			// Filter by conversations updated since last sync
			$filter->updatedAt = ['>', date('Y-m-d H:i:s', $since)];
		}

		return $filter;
	}

	/**
	 * Retrieve all records.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function all(Request $request): object
	{
		$inputs = $this->getAllInputs($request);
		$userId = $request->params()->userId ?? null;

		// Extract view from request filter parameter
		$view = $inputs->filter->view ?? 'all';
		unset($inputs->filter->view);

		// Convert modifiers object to array if needed
		$modifiers = $inputs->modifiers;
		$modifiers['view'] = $view;
		$modifiers['userId'] = $userId;

		/**
		 * We want to select by participant userId so we use the
		 * ConversationParticipant model to fetch conversations
		 * for the user.
		 */
		$result = ConversationParticipant::all(
			$inputs->filter,
			$inputs->offset,
			$inputs->limit,
			$modifiers
		);

		$rows = $result->rows ?? [];
		$this->service->enrichWithUnreadCounts($rows, (int)$userId);
		$result->rows = $rows;

		return $result;
	}

	/**
	 * Stream conversation updates via Redis-based Server-Sent Events.
	 * Listens to conversation updates and participant status changes via Redis pub/sub.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$userId = (int)($request->params()->userId ?? null);
		if (!$userId)
		{
			return;
		}

		$channels = $this->service->getSyncChannels($userId);
		$participantMap = $this->service->getParticipantConversationMap($userId);

		redisEvent(
			$channels,
			function($channel, $message) use ($userId, $participantMap)
			{
				// Handle user status updates
				if (strpos($channel, ':status') !== false)
				{
					$statusUserId = $this->service->extractUserIdFromChannel($channel);
					if (!$statusUserId)
					{
						return null;
					}
					$conversationIds = $participantMap[$statusUserId] ?? [];
					$conversationId = $conversationIds[0] ?? null;
					if (!$conversationId)
					{
						return null;
					}
					return $this->service->buildSyncResponse($conversationId, $userId);
				}

				// Handle conversation updates
				$conversationId = $message['id'] ?? $message['conversationId'] ?? null;
				if (!$conversationId)
				{
					return null;
				}

				$action = $message['action'] ?? 'merge';
				return $this->service->buildSyncResponse((int)$conversationId, $userId, $action);
			}
		);
	}
}