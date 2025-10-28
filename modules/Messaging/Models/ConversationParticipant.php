<?php declare(strict_types=1);

namespace Modules\Messaging\Models;

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
	 * @var array $fieldsBlacklist
	 */
	protected static array $fieldsBlacklist = [];

	/**
	 * @var string $idKeyName
	 */
	protected static string $idKeyName = 'id';

	/**
	 * Augments data before saving.
	 *
	 * @param mixed|null $data
	 * @return mixed
	 */
	public function augment(mixed $data = null): mixed
	{
		if (!$data) {
			return $data;
		}

		// Ensure role defaults to 'member'
		if (!isset($data['role']) || empty($data['role'])) {
			$data['role'] = 'member';
		}

		// Set joined_at if not provided
		if (!isset($data['joined_at'])) {
			$data['joined_at'] = date('Y-m-d H:i:s');
		}

		// Set is_active default
		if (!isset($data['is_active'])) {
			$data['is_active'] = 1;
		}

		return $data;
	}

	/**
	 * Formats data for API output.
	 *
	 * @param object|null $data
	 * @return object|null
	 */
	public function format(?object $data): ?object
	{
		if (!$data) {
			return null;
		}

		// Add user information
		$data->user = $this->getUser($data->user_id);

		return $data;
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
		return $this->belongsTo('\Modules\User\Models\User', 'user_id');
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

		if (!$participant) {
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

	/**
	 * Get user information.
	 *
	 * @param int $userId
	 * @return object|null
	 */
	private function getUser(int $userId): ?object
	{
		$storage = static::storage();
		$sql = $storage->table('users')
			->select(['id', 'first_name', 'last_name', 'email', 'avatar'])
			->where(['id' => $userId]);

		$users = $storage->fetch($sql);
		return $users[0] ?? null;
	}
}