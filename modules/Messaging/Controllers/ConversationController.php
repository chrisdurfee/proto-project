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
			$filter->userId = $userId;
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
		if (isset($inputs->filter->userId))
		{
			$userId = (int) $inputs->filter->userId;
			unset($inputs->filter->userId);

			// Get conversations with other participant details
			$result = $this->getConversationsWithOtherParticipants(
				$userId,
				$inputs->filter,
				$inputs->offset,
				$inputs->limit,
				$inputs->modifiers
			);
			return $this->response($result);
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
	 * Get conversations with the other participant's details.
	 *
	 * @param int $userId The current user's ID
	 * @param object|null $filter Additional filters
	 * @param int $offset Pagination offset
	 * @param int $limit Pagination limit
	 * @param array|null $modifiers Query modifiers
	 * @return object Result with rows and pagination
	 */
	private function getConversationsWithOtherParticipants(
		int $userId,
		?object $filter,
		int $offset,
		int $limit,
		?array $modifiers
	): object
	{
		$model = new ConversationParticipant();
		$storage = $model->storage;

		// Use direct SQL to avoid alias doubling issues
		$params = [$userId, $userId, $userId]; // for subquery, JOIN condition, WHERE cp.user_id

		$filterSql = '';
		if ($filter && !empty((array)$filter))
		{
			foreach ((array)$filter as $key => $value)
			{
				$filterSql .= " AND c.{$key} = ?";
				$params[] = $value;
			}
		}

		$sql = "
			SELECT
				cp.id,
				cp.conversation_id AS conversationId,
				cp.last_read_at AS lastReadAt,
				cp.last_read_message_id AS lastReadMessageId,
				c.id AS id,
				c.title AS title,
				c.type AS type,
				c.created_at AS createdAt,
				c.updated_at AS updatedAt,
				c.last_message_at AS lastMessageAt,
				u.id AS userId,
				u.first_name AS firstName,
				u.last_name AS lastName,
				u.email AS email,
				u.image AS image,
				u.display_name AS displayName,
				u.status AS userStatus,
				m.id AS lastMessageId,
				m.content AS lastMessageContent,
				m.sender_id AS lastMessageSenderId,
				(SELECT COUNT(*)
				 FROM messages m2
				 WHERE m2.conversation_id = c.id
				   AND m2.sender_id != ?
				   AND (m2.created_at > COALESCE(cp.last_read_at, '1970-01-01') OR cp.last_read_at IS NULL)
				) AS unreadCount
			FROM conversation_participants AS cp
			LEFT JOIN conversations AS c ON cp.conversation_id = c.id
			LEFT JOIN conversation_participants AS cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
			LEFT JOIN users AS u ON cp2.user_id = u.id
			LEFT JOIN messages AS m ON c.last_message_id = m.id
			WHERE cp.user_id = ?
			  AND cp.deleted_at IS NULL
			  AND (cp2.deleted_at IS NULL OR cp2.id IS NULL)
			  {$filterSql}
			ORDER BY c.last_message_at DESC
			LIMIT {$limit}
			OFFSET {$offset}
		";

		$rows = $storage->fetch($sql, $params);

		return (object)[
			'rows' => $rows ?? [],
			'count' => count($rows ?? [])
		];
	}
}