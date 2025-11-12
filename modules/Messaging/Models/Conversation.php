<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Modules\User\Models\User;
use Proto\Models\Model;

/**
 * Conversation Model
 *
 * @package Modules\Messaging\Models
 */
class Conversation extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'conversations';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'c';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'title',
		'description',
		'type',
		'createdBy',
		'lastMessageAt',
		'lastMessageId',
		'lastMessageContent',
		'lastMessageType',
	];

	/**
	 * Define joins for the model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		// Join other participants (not the current user)
		$builder->many(ConversationParticipant::class, fields: [
				'id',
				'conversationId',
				'userId',
				'role',
				'joinedAt',
				'lastReadAt',
				'lastReadMessageId',
				'createdAt',
				'updatedAt',
				'deletedAt'
			])
			->on(['id', 'conversationId'])
			->as('participants')
			// Join user info for each participant
			->one(User::class, fields: [
					'displayName',
					'firstName',
					'lastName',
					'email',
					'image',
					'status'
				])
				->on(['userId', 'id']);
	}

	/**
	 * Get messages for this conversation.
	 *
	 * @return mixed
	 */
	public function messages()
	{
		return $this->hasMany(Message::class);
	}

	/**
	 * Get participants for this conversation.
	 *
	 * @return mixed
	 */
	public function participants()
	{
		return $this->hasMany(ConversationParticipant::class);
	}

	/**
	 * Get the creator of this conversation.
	 *
	 * @return mixed
	 */
	public function creator()
	{
		return $this->belongsTo(User::class, 'created_by');
	}

	/**
	 * Get conversations for a specific user.
	 *
	 * @param int $userId
	 * @return array
	 */
	public static function getForUser(int $userId): array
	{
		$model = new static();
		return $model
			->storage
			->table()
			->select(
				['c.*'],
				[['u.first_name'], 'creatorFirstName'],
				[['u.last_name'], 'creatorLastName'],
				[['u.email'], 'creatorEmail'],
				[['p.last_read_at'], 'lastReadAt']
			)
			->join(function($joins)
			{
				$joins->left('conversation_participants', 'p')
					->on('c.id = p.conversation_id');

				$joins->left('users', 'u')
					->on('c.created_by = u.id');
			})
			->where(
				['p.user_id', $userId],
				'p.deleted_at IS NULL'
			)
			->orderBy('c.last_message_at DESC')
			->fetch();
	}

	/**
	 * Update the last message data for a conversation.
	 * This should be called whenever a new message is added.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @param string $content
	 * @param string $type
	 * @return bool
	 */
	public static function updateLastMessage(
		int $conversationId,
		int $messageId,
		string $content,
		string $type = 'text'
	): bool
	{
		return static::edit((object)[
			'id' => $conversationId,
			'lastMessageId' => $messageId,
			'lastMessageContent' => $content,
			'lastMessageType' => $type,
			'lastMessageAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * Sync conversations for a user - gets new and updated conversations.
	 *
	 * @param int $userId
	 * @param string|null $lastSync The last sync timestamp
	 * @suppresswarnings PHP0407
	 * @return array Array with 'merge' and 'deleted' conversations
	 */
	public static function sync(int $userId, ?string $lastSync = null): array
	{
		$result = [
			'merge' => [],
			'deleted' => []
		];

		// Use storage directly to avoid join conflicts with model joins
		$model = new static();
		$sql = $model->storage
			->select(['c.*'])
			->join(function($joins)
			{
				$joins->left('conversation_participants', 'cpp')
					->on('c.id = cpp.conversation_id', 'cpp.deleted_at IS NULL');
			})
			->where(['cpp.user_id', $userId]);

		if (!empty($lastSync))
		{
			$sql->orWhere("c.updated_at >= '{$lastSync}'", "c.created_at >= '{$lastSync}'");
		}

		$sql->orderBy('c.last_message_at DESC, c.id DESC');
		$conversations = $sql->fetch() ?? [];

		if (empty($conversations))
		{
			return $result;
		}

		$model = new static();
		$result['merge'] = $model->convertRows($conversations);

		// Get all conversation IDs for batch unread count query
		$result['merge'] = static::getConversationUnreadCounts($result['merge'], $userId);

		return $result;
	}

	/**
	 * Get conversations with their unread message counts for a user.
	 *
	 * @param array $conversations Array of conversation objects
	 * @param int $userId The user ID to get unread counts for
	 * @return array Conversations with unreadCount property added
	 */
	protected static function getConversationUnreadCounts(array $conversations, int $userId): array
	{
		// Get all conversation IDs for batch unread count query
		$conversationIds = array_column($conversations, 'id');

		// Batch query for unread counts - single query instead of O(n)
		$unreadCounts = static::getUnreadCountsForConversations($conversationIds, $userId);
		foreach ($conversations as $conversation)
		{
			$conversation->conversationId = $conversation->id;
			$conversation->unreadCount = $unreadCounts[$conversation->id] ?? 0;
		}
		return $conversations;
	}

	/**
	 * Get unread message counts for multiple conversations in a single query.
	 *
	 * @param array $conversationIds
	 * @param int $userId
	 * @return array Array keyed by conversation_id with unread counts
	 */
	protected static function getUnreadCountsForConversations(array $conversationIds, int $userId): array
	{
		if (empty($conversationIds))
		{
			return [];
		}

		$model = new static();
		$placeholders = implode(',', array_fill(0, count($conversationIds), '?'));

		$sql = "
			SELECT
				m.conversation_id,
				COUNT(*) as unread_count
			FROM messages m
			LEFT JOIN conversation_participants cp
				ON m.conversation_id = cp.conversation_id
				AND cp.user_id = ?
			WHERE m.conversation_id IN ({$placeholders})
				AND m.sender_id != ?
				AND (m.id > COALESCE(cp.last_read_message_id, 0))
				AND m.deleted_at IS NULL
			GROUP BY m.conversation_id
		";

		$params = array_merge([$userId], $conversationIds, [$userId]);
		$results = $model->storage->fetch($sql, $params);

		$counts = [];
		foreach ($results as $row)
		{
			$counts[$row->conversation_id] = (int)$row->unread_count;
		}

		return $counts;
	}

	/**
	 * Find an existing direct conversation between two users.
	 *
	 * @param int $userId1 First user ID
	 * @param int $userId2 Second user ID
	 * @return int|null Conversation ID if found, null otherwise
	 */
	public static function findByUser(int $userId1, int $userId2): ?int
	{
		$params = [$userId1, $userId2];
		$result = static::builder()
			->select(['c.id'])
			->join(function($joins)
			{
				$joins->right('conversation_participants', 'cp1')
					->on('c.id = cp1.conversation_id', 'cp1.user_id = ?', 'cp1.deleted_at IS NULL');

				$joins->right('conversation_participants', 'cp2')
					->on('c.id = cp2.conversation_id', 'cp2.user_id = ?', 'cp2.deleted_at IS NULL');
			})
			->where(
				['c.type', "'direct'"]
			)
			->first($params);

		return $result ? (int)$result->id : null;
	}
}