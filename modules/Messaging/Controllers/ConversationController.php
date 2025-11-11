<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Modules\Messaging\Auth\Policies\ConversationPolicy;
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
	 * Override the add method to handle participants.
	 *
	 * @param Request $request The HTTP request object.
	 * @return object Response with created conversation.
	 */
	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		if (empty($data))
		{
			return $this->error('No data provided', 400);
		}

		$userId = session()->user->id ?? null;
		$participantId = $data->participantId ?? null;

		if (!$participantId)
		{
			return $this->error('Participant ID required', 400);
		}

		return $this->createConversationWithParticipants(
			(object)[
				'type' => $data->type ?? 'direct',
				'title' => $data->title ?? null,
				'description' => $data->description ?? null,
				'createdBy' => $userId
			],
			[$userId, $participantId]
		);
	}

	/**
	 * Create a conversation and add participants.
	 *
	 * @param object $conversationData
	 * @param array $participantIds
	 * @return object Response with conversation ID
	 */
	protected function createConversationWithParticipants(object $conversationData, array $participantIds): object
	{
		$model = new Conversation($conversationData);
		$result = $model->add();

		if (!$result || !isset($model->id))
		{
			return $this->error('Failed to create conversation', 500);
		}

		$success = $this->addParticipants((int)$model->id, $participantIds);
		if (!$success)
		{
			return $this->error('Failed to add participants', 500);
		}

		return $this->response(['id' => (int)$model->id]);
	}

	/**
	 * Add multiple participants to a conversation.
	 *
	 * @param int $conversationId
	 * @param array $userIds
	 * @return bool
	 */
	protected function addParticipants(int $conversationId, array $userIds): bool
	{
		$success = true;
		foreach ($userIds as $userId)
		{
			$result = $this->addParticipant($conversationId, (int)$userId);
			if ($result === false)
			{
				$success = false;
			}
		}

		return $success;
	}

	/**
	 * Add a participant to a conversation.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return bool
	 */
	protected function addParticipant(int $conversationId, int $userId): bool
	{
		return ConversationParticipant::create((object)[
			'conversationId' => $conversationId,
			'userId' => $userId,
			'isActive' => 1
		]);
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
	 * Find existing conversation with a user or create a new one.
	 *
	 * @param Request $request
	 * @return object Response with conversation ID
	 */
	public function findOrCreate(Request $request): object
	{
		$participantId = $request->getInt('participantId');
		if (!$participantId)
		{
			return $this->error('Participant ID required', 400);
		}

		$userId = session()->user->id ?? null;
		$conversationId = Conversation::findByUser($userId, $participantId);
		if (is_int($conversationId))
		{
			return $this->response([
				'id' => $conversationId,
				'existing' => true
			]);
		}

		$result = $this->createConversationWithParticipants(
			(object)[
				'type' => 'direct',
				'createdBy' => $userId
			],
			[$userId, $participantId]
		);

		if ($result->success)
		{
			$result->existing = false;
		}

		return $result;
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
		$modifiers = is_object($inputs->modifiers) ? (array)$inputs->modifiers : ($inputs->modifiers ?? []);
		$modifiers['view'] = $view;
		$modifiers['userId'] = $userId;

		// Use ConversationParticipant::all() with Proto's built-in joins
		$result = ConversationParticipant::all($inputs->filter, $inputs->offset, $inputs->limit, $modifiers);

		// Add unread counts in batch (single query instead of O(n))
		if (!empty($result->rows))
		{
			$conversationIds = array_column($result->rows, 'conversationId');
			$unreadCounts = Conversation::getUnreadCountsForConversations($conversationIds, $userId);

			foreach ($result->rows as $row)
			{
				$row->unreadCount = $unreadCounts[$row->conversationId] ?? 0;
			}
		}

		return $result;
	}

	/**
	 * Stream conversation updates via Server-Sent Events.
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

		$lastSync = date('Y-m-d H:i:s');
		$INTERVAL_IN_SECONDS = 5;
		$firstSync = true;

		serverEvent($INTERVAL_IN_SECONDS, function() use ($userId, &$lastSync, &$firstSync)
		{
			$previousSync = $lastSync;

			/**
			 * Update the last sync timestamp for the next check.
			 */
			$lastSync = date('Y-m-d H:i:s');
			$response = Conversation::sync($userId, $previousSync);

			if ($firstSync)
			{
				$firstSync = false;
				return $response;
			}

			/**
			 * Only return data if there are changes.
			 */
			$hasChanges = !empty($response['merge']) || !empty($response['deleted']);
			return $hasChanges ? $response : null;
		});
	}
}