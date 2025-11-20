<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Modules\Messaging\Storage\ConversationParticipantStorage;
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
				fields: ['displayName', 'firstName', 'lastName', 'email', 'image', 'status']
			)
			->on(['userId', 'id']);

		$builder
			->one(
				Conversation::class,
				fields: ['title', 'type', 'lastMessageAt', 'lastMessageId', 'lastMessageContent', 'lastMessageType']
			)
			->on(['conversationId', 'id'])
			->one(
				Message::class,
				fields: ['content', 'type', 'parentId', 'senderId', 'isEdited', 'editedAt']
			)
			->on(['lastMessageId', 'id'])
			->as('lastMessage');

		// Join participants
		$builder->many(ConversationParticipant::class, alias: 'cpp', fields: [
				'id',
				'userId',
				'role',
				'joinedAt',
				'lastReadAt',
				'lastReadMessageId',
				'createdAt',
				'updatedAt',
				'deletedAt'
			])
			->on(['conversationId', 'conversationId'])
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
		return static::builder()
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

	/**
	 * Update the last read position for a participant.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @param int $messageId
	 * @return bool
	 */
	public static function updateLastRead(int $conversationId, int $userId, int $messageId): ?bool
	{
		$participant = static::getBy([
			'cp.conversation_id' => $conversationId,
			'cp.user_id' => $userId
		]);

		if (!$participant)
		{
			return false;
		}

		if ($participant->lastReadMessageId >= $messageId)
		{
			return null;
		}

		return static::edit((object)[
			'id' => $participant->id,
			'lastReadMessageId' => $messageId,
			'lastReadAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * @var string $storageType
	 */
	protected static string $storageType = ConversationParticipantStorage::class;
}