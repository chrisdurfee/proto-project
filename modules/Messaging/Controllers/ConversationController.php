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

		// Move view from filter to modifiers
		$view = $inputs->filter->view ?? 'all';
		unset($inputs->filter->view);

		if (!isset($inputs->modifiers) || !is_array($inputs->modifiers))
		{
			$inputs->modifiers = [];
		}
		$inputs->modifiers['view'] = $view;
		$inputs->modifiers['userId'] = $userId;

		// Debug: Log the modifier values
		error_log("Modifiers being passed: " . json_encode($inputs->modifiers));

		// Use ConversationParticipant::all() with Proto's built-in joins
		$result = ConversationParticipant::all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);

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