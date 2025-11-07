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
			->select()
			->join(function($joins)
			{
				$joins->left('conversation_participants', 'cpp')
					->on('c.id = cpp.conversation_id AND cpp.deleted_at IS NULL');
			})
			->where(['cpp.user_id', $userId]);

		if (!empty($lastSync))
		{
			$sql->where("c.updated_at > '{$lastSync}'");
		}

		$sql->orderBy('c.last_message_at DESC, c.id DESC');
		$conversations = $sql->fetch();

		// Load participants for each conversation
		foreach ($conversations as $conversation)
		{
			$conversation->unreadCount = ConversationParticipant::getUnreadCount($conversation->id, $userId);
		}

		$result['merge'] = $conversations;
		return $result;
	}
}