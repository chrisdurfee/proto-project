<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Modules\Messaging\Auth\Policies\ConversationPolicy;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\Message;
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
	 * Adds a model item.
	 *
	 * This method initializes the model with the provided data and adds user data for creation and updates.
	 *
	 * @param object $data The data to set up the model with.
	 * @return object The response object.
	 */
	protected function addItem(object $data): object
	{
		$data->type ??= 'direct';
		$result = parent::addItem($data);
		if (!$result->success)
		{
			return $result;
		}

		/**
		 * We need to add the participants to the conversation.
		 */
		$userId = session()->user->id ?? null;
		$participantIds = [$userId, $data->participantId ?? null];

		/**
		 * This will prevent creating aconversation with yourself.
		 */
		if($userId === $data->participantId)
		{
			return $this->error('Cannot create a conversation with yourself', 200);
		}

		$success = $this->addParticipants((int)$result->id, $participantIds);
		if (!$success)
		{
			return $this->error('Failed to add participants', 500);
		}
		return $result;
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

		// Publish Redis event to notify all participants
		foreach ($userIds as $userId)
		{
			events()->emit("redis:user:{$userId}:conversations", [
				'id' => (int)$conversationId,
				'action' => 'merge'
			]);
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
			'role' => 'member',
			'joinedAt' => date('Y-m-d H:i:s')
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
		if (!is_int($participantId))
		{
			return $this->error('Participant ID required', 400);
		}

		/**
		 * Get the current authenticated user.
		 */
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('User not authenticated', 401);
		}

		/**
		 * Prevent users from starting a conversation with themselves.
		 */
		if ($userId === $participantId)
		{
			return $this->error('Cannot create a conversation with yourself', 200);
		}

		/**
		 * Validate that the participant user exists before attempting to create conversation.
		 */
		$participant = modules()->user()->get($participantId);
		if (!$participant)
		{
			return $this->error('Participant user not found', 404);
		}

		/**
		 * We want to check if we already have a conversation
		 * between the current user and the participant.
		 */
		$conversationId = Conversation::findByUser($userId, $participantId);
		if (is_int($conversationId))
		{
			return $this->response([
				'id' => $conversationId,
				'existing' => true
			]);
		}

		/**
		 * No existing conversation found, create a new one.
		 */
		$result = $this->addItem(
			(object)[
				'type' => 'direct',
				'createdBy' => $userId,
				'title' => null,
				'description' => null,
				'participantId' => $participantId
			]);

		if ($result->success)
		{
			$result->existing = false;

			/**
			 * Publish Redis event to notify the current user about the new conversation
			 * so the frontend can update in real-time.
			 */
			events()->emit("redis:user:{$userId}:conversations", [
				'id' => (int)$result->id,
				'action' => 'merge'
			]);
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

		/**
		 * We need to add all the unread counts to the messages.
		 */
		if (!empty($result->rows))
		{
			/**
			 * Fetch unread counts for all conversations in one query
			 * to optimize performance.
			 */
			$conversationIds = array_column($result->rows, 'conversationId');
			$unreadCounts = Message::getUnreadCountsForConversations($conversationIds, (int)$userId);

			foreach ($result->rows as $row)
			{
				$row->unreadCount = $unreadCounts[$row->conversationId] ?? 0;
			}
		}

		return $result;
	}

	/**
	 * Helper to fetch conversation data with unread count.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return object|null
	 */
	protected function getConversationData(int $conversationId, int $userId): ?object
	{
		// Fetch the updated conversation data
		$conversation = Conversation::get($conversationId);
		if (!$conversation)
		{
			return null; // Conversation not found
		}

		// Get unread count for this conversation
		$unreadCounts = Message::getUnreadCountsForConversations([$conversationId], $userId);

		/**
		 * The conversation model will not allow you to set
		 * properties that are not added to the fields or joins fields.
		 *
		 * This will get the model data as an object so we can map
		 * custom properties to the it before sending.
		 */
		$conversation = $conversation->getData();
		$conversation->unreadCount = $unreadCounts[$conversationId] ?? 0;
		$conversation->conversationId = $conversationId;
		return $conversation;
	}

	/**
	 * Get all participant user IDs from user's conversations with their conversation IDs.
	 *
	 * @param int $userId
	 * @return array Map of userId => [conversationIds]
	 */
	protected function getConversationParticipantIds(int $userId): array
	{
		$participants = ConversationParticipant::fetchWhere([
			['cp.userId', $userId]
		]);

		if (empty($participants))
		{
			return [];
		}

		// Collect unique participant IDs with their conversation IDs
		$participantMap = [];
		foreach ($participants as $participant)
		{
			if (isset($participant->participants) && is_array($participant->participants))
			{
				foreach ($participant->participants as $p)
				{
					$pUserId = $p->userId ?? null;
					if ($pUserId && $pUserId !== $userId)
					{
						if (!isset($participantMap[$pUserId]))
						{
							$participantMap[$pUserId] = [];
						}
						$participantMap[$pUserId][] = $participant->conversationId;
					}
				}
			}
		}

		return $participantMap;
	}

	/**
	 * Get channels to subscribe to for a user.
	 *
	 * @param int $userId
	 * @return array
	 */
	protected function getSyncChannels(int $userId): array
	{
		$channels = ["user:{$userId}:conversations"];

		$participantMap = $this->getConversationParticipantIds($userId);
		foreach ($participantMap as $participantId => $conversationIds)
		{
			$channels[] = "user:{$participantId}:status";
		}

		return $channels;
	}

	/**
	 * Extract user ID from status channel name.
	 *
	 * @param string $channel
	 * @return int|null
	 */
	protected function extractUserIdFromChannel(string $channel): ?int
	{
		$parts = explode(':', $channel);
		return isset($parts[1]) ? (int)$parts[1] : null;
	}

	/**
	 * Handle status update message.
	 *
	 * @param string $channel
	 * @param array $message
	 * @param int $userId
	 * @param array $participantMap
	 * @return int|null
	 */
	protected function handleStatusUpdate(string $channel, array $message, int $userId, array $participantMap): ?int
	{
		$statusUserId = $this->extractUserIdFromChannel($channel);
		if (!$statusUserId)
		{
			return null;
		}

		// Get first conversation ID where this user is a participant
		$conversationIds = $participantMap[$statusUserId] ?? [];
		return $conversationIds[0] ?? null;
	}

	/**
	 * Build sync response for conversation update.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param string $action
	 * @return array|null
	 */
	protected function buildSyncResponse(int $conversationId, int $userId, string $action = 'merge'): ?array
	{
		if ($action === 'delete')
		{
			return [
				'merge' => [],
				'deleted' => [$conversationId]
			];
		}

		$conversation = $this->getConversationData($conversationId, $userId);
		if (!$conversation)
		{
			return null;
		}

		return [
			'merge' => [$conversation],
			'deleted' => []
		];
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

		$channels = $this->getSyncChannels($userId);
		$participantMap = $this->getConversationParticipantIds($userId);

		redisEvent(
			$channels,
			function($channel, $message) use ($userId, $participantMap)
			{
				// Handle user status updates
				if (strpos($channel, ':status') !== false)
				{
					$conversationId = $this->handleStatusUpdate($channel, $message, $userId, $participantMap);
					if (!$conversationId)
					{
						return null;
					}
					return $this->buildSyncResponse($conversationId, $userId);
				}

				// Handle conversation updates
				$conversationId = $message['id'] ?? $message['conversationId'] ?? null;
				if (!$conversationId)
				{
					return null;
				}

				$action = $message['action'] ?? 'merge';
				return $this->buildSyncResponse((int)$conversationId, $userId, $action);
			}
		);
	}
}