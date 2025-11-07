<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

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
	 * Override the add method to handle file attachments.
	 *
	 * @param Request $request The HTTP request object.
	 * @return object Response with created conversation and attachments.
	 */
	public function add(Request $request): object
	{
		$result = parent::add($request);
		if ($result->success === false)
		{
			return $result;
		}

		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		$data = $this->getRequestItem($request);
		if (empty($data))
		{
			return $this->error('No data provided', 400);
		}

		// Add participants
		$addResult = $this->addParticipants(
			$result->id,
			[
				$data->participantId,
				$userId
			]
		);

		if ($addResult === false)
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
			$filter->{'m.id'} = ['>', $since];
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
		if (1 || isset($inputs->filter->userId))
		{
			$userId = (int) $inputs->filter->userId;
			$view = $inputs->filter->view ?? 'all';
			unset($inputs->filter->view);

			$rows = ConversationParticipant::all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
			return $rows;

			unset($inputs->filter->userId);
			unset($inputs->filter->view);

			// Use storage->select() to use model's default fields and joins
			$model = $this->model();
			$builder = $model->storage
				->select()
				// Manually join to filter by user_id - same pattern as sync()
				->join(function($joins) use ($userId)
				{
					$joins->left('conversation_participants', 'cpp')
						->on("c.id = cpp.conversation_id AND cpp.deleted_at IS NULL");
				})
				->where(
					['cpp.user_id', $userId]
				);

			// Apply additional filters
			if ($inputs->filter && !empty((array)$inputs->filter))
			{
				foreach ((array)$inputs->filter as $key => $value)
				{
					$builder->where(['c.' . $key => $value]);
				}
			}

			// Apply view filter for unread
			if ($view === 'unread')
			{
				// Use subquery to filter conversations with unread messages
				$builder->where(
					"EXISTS (SELECT 1 FROM messages m3 WHERE m3.conversation_id = c.id AND m3.sender_id != {$userId} AND (m3.id > COALESCE((SELECT cp2.last_read_message_id FROM conversation_participants cp2 WHERE cp2.conversation_id = c.id AND cp2.user_id = {$userId}), 0)) AND m3.deleted_at IS NULL LIMIT 1)"
				);
			}

			$builder->orderBy('c.last_message_at DESC, c.id DESC');

			if ($inputs->limit > 0)
			{
				$builder->limit($inputs->limit, $inputs->offset);
			}

			$rows = $builder->fetch();

			if (!empty($rows))
			{
				// Get all conversation IDs for batch unread count query
				$conversationIds = array_column($rows, 'id');

				// Batch query for unread counts - single query instead of O(n)
				$unreadCounts = Conversation::getUnreadCountsForConversations($conversationIds, $userId);

				// Attach unread counts to conversations
				foreach ($rows as $conversation)
				{
					$conversation->unreadCount = $unreadCounts[$conversation->id] ?? 0;
				}
			}

			return $this->response((object)[
				'rows' => $rows,
				'count' => count($rows)
			]);
		}

		$result = $this->model::all(
			$inputs->filter,
			$inputs->offset,
			$inputs->limit,
			$inputs->modifiers
		);
		return $this->response($result);
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

		serverEvent($INTERVAL_IN_SECONDS, function() use ($userId, &$lastSync)
		{
			$response = Conversation::sync($userId, $lastSync);

			/**
			 * Update the last sync timestamp for the next check.
			 */
			$lastSync = date('Y-m-d H:i:s');

			/**
			 * Only return data if there are changes.
			 */
			$hasChanges = !empty($response['merge']) || !empty($response['deleted']);
			return $hasChanges ? $response : null;
		});
	}
}