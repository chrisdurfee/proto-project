<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Modules\User\Main\Models\User;
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
		return static::builder()
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
		$conversations = $sql->fetch();
		if (empty($conversations))
		{
			return $result;
		}

		$result['merge'] = $model->convertRows($conversations);

		return $result;
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
				"c.type = 'direct'"
			)
			->first($params);

		return $result ? (int)$result->id : null;
	}
}