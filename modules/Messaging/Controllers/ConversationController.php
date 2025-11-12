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
	 * Override the add method to handle participants.
	 *
	 * @param Request $request The HTTP request object.
	 * @return object Response with created conversation.
	 */
	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		$participantId = $data->participantId ?? null;
		$userId = session()->user->id ?? null;

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
		$model = $this->model($conversationData);
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

		// Publish Redis event to notify all participants
		foreach ($participantIds as $userId)
		{
			events()->emit("redis:user:{$userId}:conversations", [
				'id' => (int)$model->id,
				'action' => 'merge'
			]);
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
		$modifiers = $inputs->modifiers;
		$modifiers['view'] = $view;
		$modifiers['userId'] = $userId;

		$result = ConversationParticipant::all(
			$inputs->filter,
			$inputs->offset,
			$inputs->limit,
			$modifiers
		);
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
	 * Stream conversation updates via Redis-based Server-Sent Events.
	 * Listens to conversation updates published via Redis pub/sub.
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

		// Subscribe to user's conversation updates channel
		redisEvent(
			"user:{$userId}:conversations",
			function($channel, $message) use ($userId)
			{
				// Message contains conversation ID from Redis publish
				$conversationId = $message['id'] ?? $message['conversationId'] ?? null;
				if (!$conversationId)
				{
					return null; // Invalid message, skip
				}

				// Fetch the updated conversation data
				$conversation = Conversation::get($conversationId);
				if (!$conversation)
				{
					return null; // Conversation not found
				}

				// Get unread count for this conversation
				$unreadCounts = Conversation::getUnreadCountsForConversations([$conversationId], $userId);
				$conversation = $conversation->getData();
				$conversation->unreadCount = $unreadCounts[$conversationId] ?? 0;
				$conversation->conversationId = $conversationId;

				// Determine action type from message
				$action = $message['action'] ?? 'merge';

				return [
					'merge' => $action === 'merge' ? [$conversation] : [],
					'deleted' => $action === 'delete' ? [$conversationId] : []
				];
			}
		);
	}
}