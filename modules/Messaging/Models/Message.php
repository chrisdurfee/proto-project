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
		$model = new static();
		return $model
			->storage
			->table()
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

		$model = new static();

		if (!$lastSync)
		{
			// First sync, return recent messages (limit to last 50)
			$result['merge'] = $model
				->storage
				->select()
				->where(
					['m.conversation_id', $conversationId],
					"m.deleted_at IS NULL"
				)
				->orderBy('m.created_at DESC')
				->limit(50)
				->fetch() ?? [];

			$result['merge'] = $model->convertRows($result['merge']);
			return $result;
		}

		// Get newly created and updated messages
		$result['merge'] = $model
			->storage
			->select()
			->where(
				['m.conversation_id', $conversationId],
				"m.deleted_at IS NULL"
			)
			->orWhere(
				"m.created_at > '{$lastSync}'",
				"m.updated_at > '{$lastSync}'"
			)
			->orderBy('m.created_at ASC')
			->fetch() ?? [];

		// Get deleted messages (soft-deleted after last sync)
		$deletedMessages = $model
			->storage
			->select()
			->where(
				['m.conversation_id', $conversationId],
				"m.deleted_at > '{$lastSync}'"
			)
			->fetch();

		$result['deleted'] = array_map(fn($msg) => $msg->id, $deletedMessages ?? []);
		$result['merge'] = $model->convertRows($result['merge']);
		$result['deleted'] = $model->convertRows($result['deleted']);

		return $result;
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

	/**
	 * Mark messages as read up to a specific message ID.
	 * Updates the participant's lastReadMessageId and lastReadAt.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param int|null $messageId If null, marks all messages as read
	 * @return bool
	 */
	public static function markAsRead(int $conversationId, int $userId, ?int $messageId = null): bool
	{
		// If no message ID provided, get the latest message in the conversation
		if ($messageId === null)
		{
			$latestMessage = static::find()
				->where(['m.conversation_id', $conversationId])
				->orderBy('m.id DESC')
				->first();

			if (!$latestMessage)
			{
				return false;
			}

			$messageId = $latestMessage->id;
		}

		return ConversationParticipant::updateLastRead($conversationId, $userId, $messageId);
	}

	/**
	 * Get the count of unread messages for a user in a conversation.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return int
	 */
	public static function getUnreadCount(int $conversationId, int $userId): int
	{
		$participant = ConversationParticipant::getBy([
			'conversationId' => $conversationId,
			'userId' => $userId
		]);

		if (!$participant || !$participant->lastReadMessageId)
		{
			// If no last read message, all messages are unread
			$model = new static();
			$count = $model->storage->table()
				->select('COUNT(*) as count')
				->where(
					['m.conversation_id', $conversationId],
					'm.deleted_at IS NULL'
				)
				->fetch()[0] ?? null;

			return (int)($count->count ?? 0);
		}

		// Count messages with ID greater than last read
		$model = new static();
		$count = $model->storage->table()
			->select('COUNT(*) as count')
			->where(
				['m.conversation_id', $conversationId],
				['m.id', '>', $participant->lastReadMessageId],
				'm.deleted_at IS NULL'
			)
			->fetch()[0] ?? null;

		return (int)($count->count ?? 0);
	}
}