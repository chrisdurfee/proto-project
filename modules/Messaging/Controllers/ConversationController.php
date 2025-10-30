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

		// Add participant
		ConversationParticipant::create((object)[
			'conversationId' => $result->id,
			'userId' => $data->participantId,
			'isActive' => 1
		]);

		// Add creator as participant
		ConversationParticipant::create((object)[
			'conversationId' => $result->id,
			'userId' => $userId,
			'isActive' => 1
		]);

		return $result;
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

		// Build the query using Proto's table builder (bypasses model joins)
		$result = $storage->table()->select(
			['cp.id'],
			['cp.conversation_id', 'conversationId'],
			['cp.last_read_at', 'lastReadAt'],
			['cp.last_read_message_id', 'lastReadMessageId'],
			// Conversation fields
			['c.id', 'id'],
			['c.title', 'title'],
			['c.type', 'type'],
			['c.created_at', 'createdAt'],
			['c.updated_at', 'updatedAt'],
			['c.last_message_at', 'lastMessageAt'],
			// Other participant's user fields
			['u.id', 'userId'],
			['u.first_name', 'firstName'],
			['u.last_name', 'lastName'],
			['u.email', 'email'],
			['u.image', 'image'],
			['u.display_name', 'displayName'],
			['u.status', 'userStatus'],
			// Last message fields
			['m.id', 'lastMessageId'],
			['m.content', 'lastMessageContent'],
			['m.message_type', 'lastMessageType'],
			['m.sender_id', 'lastMessageSenderId'],
			// Unread count subquery
			[
				'(SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = c.id AND m2.sender_id != ? AND (m2.created_at > COALESCE(cp.last_read_at, \'1970-01-01\') OR cp.last_read_at IS NULL))',
				'unreadCount'
			]
		)
		->join(function($joins)
		{
			// Join conversation
			$joins->left('conversations', 'c')
				->on('cp.conversation_id = c.id');

			// Join to get the other participant
			$joins->left('conversation_participants', 'cp2')
				->on('c.id = cp2.conversation_id');

			$joins->left('users', 'u')
				->on('cp2.user_id = u.id');

			// Join last message
			$joins->left('messages', 'm')
				->on('c.last_message_id = m.id');
		})
		->where(
			['cp.user_id', $userId],
			['cp2.user_id !=', $userId],
			'cp.deleted_at IS NULL',
			'cp2.deleted_at IS NULL'
		);

		// Apply any additional filters
		if ($filter && !empty((array)$filter))
		{
			$conditions = [];
			foreach ((array)$filter as $key => $value)
			{
				$conditions[] = ["c.{$key}", $value];
			}
			$result->where(...$conditions);
		}

		// Order and paginate
		$result->orderBy('c.last_message_at DESC')
			->limit($limit)
			->offset($offset);

		// Execute query with userId for subquery
		$rows = $result->fetch([$userId]);

		return (object)[
			'rows' => $rows ?? [],
			'count' => count($rows ?? [])
		];
	}
}