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
				fields: ['displayName', 'firstName', 'lastName', 'email', 'image']
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
			'new' => [],
			'updated' => [],
			'deleted' => []
		];

		$model = new static();

		if (!$lastSync)
		{
			// First sync, return recent messages (limit to last 50)
			$result['new'] = $model
				->storage
				->table()
				->select(['m.*'])
				->where(
					['m.conversation_id', $conversationId],
					"m.deleted_at IS NULL"
				)
				->orderBy('m.created_at DESC')
				->limit(50)
				->fetch() ?? [];
			return $result;
		}

		// Get newly created messages
		$result['new'] = $model
			->storage
			->table()
			->select(['m.*'])
			->where(
				['m.conversation_id', $conversationId],
				"m.created_at > '{$lastSync}'",
				"m.deleted_at IS NULL"
			)
			->orderBy('m.created_at ASC')
			->fetch() ?? [];

		// Get updated messages (updated after last sync, but created before)
		$result['updated'] = $model
			->storage
			->table()
			->select(['m.*'])
			->where(
				['m.conversation_id', $conversationId],
				"m.created_at <= '{$lastSync}'",
				"m.updated_at > '{$lastSync}'",
				"m.deleted_at IS NULL"
			)
			->fetch() ?? [];

		// Get deleted messages (soft-deleted after last sync)
		$deletedMessages = $model
			->storage
			->table()
			->select(['m.id'])
			->where(
				['m.conversation_id', $conversationId],
				"m.deleted_at > '{$lastSync}'"
			)
			->fetch();

		$result['deleted'] = array_map(fn($msg) => $msg->id, $deletedMessages ?? []);

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
		$message = static::get($messageId);
		if (!$message)
		{
			return false;
		}

		$message->updatedAt = date('Y-m-d H:i:s');
		return $message->save();
	}
}