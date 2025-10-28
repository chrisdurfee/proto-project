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
		'conversation_id',
		'user_id',
		'role',
		'joined_at',
		'last_read_at',
		'last_read_message_id',
		'is_active',
		'created_at',
		'updated_at'
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
				fields: ['id', 'displayName', 'firstName', 'lastName', 'email', 'image']
			)
			->on(['user_id', 'id']);
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
			'joined_at' => date('Y-m-d H:i:s'),
			'is_active' => 1
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

		$participant->is_active = 0;
		return $participant->update();
	}

	/**
	 * Get participants for a conversation.
	 *
	 * @param int $conversationId
	 * @return array
	 */
	public static function getForConversation(int $conversationId): array
	{
		$storage = static::storage();

		$sql = $storage->table('conversation_participants', 'cp')
			->select([
				'cp.*',
				'u.first_name',
				'u.last_name',
				'u.email',
				'u.avatar'
			])
			->join('users u', 'cp.user_id = u.id')
			->where([
				'cp.conversation_id' => $conversationId,
				'cp.is_active' => 1
			]);

		return $storage->fetch($sql);
	}
}