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
	];

	/**
	 * Define joins for the model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
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
			->one(User::class, fields: [
					'displayName',
					'firstName',
					'lastName',
					'email',
					'image',
					'status',
					'email',
					'mobile'
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
}