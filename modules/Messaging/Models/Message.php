<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Modules\User\Models\User;
use Proto\Models\Model;

/**
 * Message Model
 *
 * @package Modules\Messaging\Models
 */
class Message extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'messages';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'm';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'conversationId',
		'senderId',
		'parentId',
		'type',
		'content',
		'isEdited',
		'editedAt',
		'deletedAt'
	];

	/**
	 * Define joins for the model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		$builder
			->one(
				Conversation::class,
				fields: ['title']
			)
			->on(['conversation_id', 'id']);

		$builder
			->one(
				User::class,
				fields: ['displayName', 'firstName', 'lastName', 'email', 'image', 'status']
			)
			->on(['sender_id', 'id']);

		// Include attachments
		$builder
			->many(
				MessageAttachment::class,
				fields: ['id', 'messageId', 'fileUrl', 'fileType', 'fileName', 'fileSize', 'createdAt']
			)
			->on(['id', 'message_id'])
			->as('attachments');

		// Include reactions with user info
		$builder
			->many(
				MessageReaction::class,
				fields: ['id', 'messageId', 'userId', 'emoji', 'createdAt']
			)
			->on(['id', 'message_id'])
			->as('reactions');
	}

	/**
	 * Get the conversation this message belongs to.
	 *
	 * @return mixed
	 */
	public function conversation()
	{
		return $this->belongsTo(Conversation::class, 'conversation_id');
	}

	/**
	 * Get the sender of this message.
	 *
	 * @return mixed
	 */
	public function sender()
	{
		return $this->belongsTo(User::class, 'sender_id');
	}

	/**
	 * Get attachments for this message.
	 *
	 * @return mixed
	 */
	public function attachments()
	{
		return $this->hasMany(MessageAttachment::class, 'message_id');
	}

	/**
	 * Get reactions for this message.
	 *
	 * @return mixed
	 */
	public function reactions()
	{
		return $this->hasMany(MessageReaction::class, 'message_id');
	}

	/**
	 * Get messages for a conversation.
	 *
	 * @param int $conversationId
	 * @param int $limit
	 * @param int $offset
	 * @return array
	 */
	public static function getForConversation(int $conversationId, int $limit = 50, int $offset = 0): array
	{
		return static::builder()
			->select(
				['m.*'],
				[['u.first_name'], 'senderFirstName'],
				[['u.last_name'], 'senderLastName'],
				[['u.email'], 'senderEmail'],
				[['u.image'], 'senderAvatar']
			)
			->join(function($joins)
			{
				$joins->left('users', 'u')
					->on('m.sender_id = u.id');
			})
			->where(
				['m.conversation_id', $conversationId]
			)
			->orderBy('m.created_at DESC')
			->limit($limit)
			->offset($offset)
			->fetch();
	}

	/**
	 * Sync messages for a conversation - gets new, updated, and deleted messages.
	 *
	 * @param int $conversationId
	 * @param string|null $lastSync The last sync timestamp
	 * @return array Array with 'new', 'updated', and 'deleted' messages
	 */
	public static function sync(int $conversationId, ?string $lastSync = null): array
	{
		$result = [
			'merge' => [],
			'deleted' => []
		];

		// Get newly created and updated messages
		$sql = static::where([
			['m.conversation_id', $conversationId],
			"m.deleted_at IS NULL"
		]);

		if (!empty($lastSync))
		{
			$sql->orWhere(
				"m.created_at >= '{$lastSync}'",
				"m.updated_at >= '{$lastSync}'"
			);
		}

		$result['merge'] = $sql->fetch();

		// Get deleted messages (soft-deleted after last sync)
		$deletedMessages = static::builder()
			->select(['m.id'])
			->where(
				['m.conversation_id', $conversationId],
				"m.deleted_at >= '{$lastSync}'"
			)
			->fetch();

		$model = new static();
		$result['merge'] = $model->convertRows($result['merge']);
		$result['deleted'] = $model->convertRows($deletedMessages);

		return $result;
	}

	/**
	 * Get unread message count for a participant.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return int
	 */
	public static function getUnreadCount(int $conversationId, int $userId): int
	{
		$count = static::builder()
			->select([['COUNT(*)'], 'count'])
			->join(function($joins)
			{
				$joins->left('conversation_participants', 'cp')
					->on('m.conversation_id = cp.conversation_id', 'cp.user_id = ?');
			})
			->where(
				['m.conversation_id', $conversationId],
				['m.sender_id', '!=', $userId],
				"(m.id > COALESCE(cp.last_read_message_id, 0))",
				"m.deleted_at IS NULL"
			)
			->first();

		return (int)($count->count ?? 0);
	}

	/**
	 * Get unread message counts for multiple conversations in a single query.
	 *
	 * @param array $conversationIds
	 * @param int $userId
	 * @return array Array keyed by conversation_id with unread counts
	 */
	public static function getUnreadCountsForConversations(array $conversationIds, int $userId): array
	{
		if (empty($conversationIds))
		{
			return [];
		}

		$placeholders = implode(',', array_fill(0, count($conversationIds), '?'));

		$rows = static::builder()
			->select(
				['m.conversation_id'],
				[['COUNT(*)'], 'unread_count']
			)
			->join(function($joins)
			{
				$joins->left('conversation_participants', 'cp')
					->on('m.conversation_id = cp.conversation_id');
			})
			->where(
				["m.conversation_id IN ({$placeholders})", $conversationIds],
				['m.sender_id', '!=', $userId],
				["cp.user_id", $userId],
				"(m.id > COALESCE(cp.last_read_message_id, 0))",
				"m.deleted_at IS NULL"
			)
			->groupBy('m.conversation_id')
			->fetch();

		$counts = [];
		foreach ($rows as $row)
		{
			$counts[$row->conversation_id] = (int)$row->unread_count;
		}

		return $counts;
	}

	/**
	 * Touch the message to update its updatedAt timestamp.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	public static function touch(int $messageId): bool
	{
		return static::edit((object)[
			'id' => $messageId,
			'updatedAt' => date('Y-m-d H:i:s')
		]);
	}
}