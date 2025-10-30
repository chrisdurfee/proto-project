<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Modules\User\Models\User;
use Proto\Models\Model;

/**
 * ConversationParticipant Model
 *
 * @package Modules\Messaging\Models
 */
class ConversationParticipant extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'conversation_participants';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'cp';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
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
				User::class,
				fields: ['id', 'displayName', 'firstName', 'lastName', 'email', 'image', ['status', 'userStatus']]
			)
			->on(['user_id', 'id']);

		// Join the conversation details
		$builder
			->one(
				Conversation::class,
				fields: ['id', 'title', 'createdAt', 'updatedAt', 'type', 'lastMessageAt', 'lastMessageId']
			)
			->on(['conversation_id', 'id']);

		// Join the last message details
		$builder
			->one(
				Message::class,
				fields: ['id', 'content', 'messageType', 'senderId', 'createdAt']
			)
			->on(['lastMessageId', 'id'])
			->as('lastMessage');
	}

	/**
	 * Get the conversation this participant belongs to.
	 *
	 * @return mixed
	 */
	public function conversation()
	{
		return $this->belongsTo(Conversation::class, 'conversation_id');
	}

	/**
	 * Get the user for this participant.
	 *
	 * @return mixed
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id');
	}

	/**
	 * Add a participant to a conversation.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param string $role
	 * @return bool
	 */
	public static function addToConversation(int $conversationId, int $userId, string $role = 'member'): bool
	{
		$data = [
			'conversation_id' => $conversationId,
			'user_id' => $userId,
			'role' => $role,
			'joined_at' => date('Y-m-d H:i:s')
		];

		$participant = static::create((object)$data);
		return $participant !== null;
	}

	/**
	 * Remove a participant from a conversation.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return bool
	 */
	public static function removeFromConversation(int $conversationId, int $userId): bool
	{
		$participant = static::getBy([
			'conversation_id' => $conversationId,
			'user_id' => $userId
		]);

		if (!$participant)
		{
			return false;
		}

		return $participant->delete();
	}

	/**
	 * Get participants for a conversation.
	 *
	 * @param int $conversationId
	 * @return array
	 */
	public static function getForConversation(int $conversationId): array
	{
		$model = new static();
		return $model
			->storage
			->table()
			->select(
				['cp.*'],
				[['u.first_name'], 'firstName'],
				[['u.last_name'], 'lastName'],
				[['u.email'], 'email'],
				[['u.image'], 'avatar']
			)
			->join(function($joins)
			{
				$joins->left('users', 'u')
					->on('cp.user_id = u.id');
			})
			->where(
				['cp.conversation_id', $conversationId],
				'cp.deleted_at IS NULL'
			)
			->fetch();
	}
}