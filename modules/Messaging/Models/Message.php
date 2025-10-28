<?php declare(strict_types=1);

namespace Modules\Messaging\Models;

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
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'conversation_id',
		'sender_id',
		'content',
		'message_type',
		'file_url',
		'file_name',
		'file_size',
		'audio_duration',
		'is_edited',
		'edited_at',
		'read_at',
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

		// Ensure message_type defaults to 'text'
		if (!isset($data['message_type']) || empty($data['message_type'])) {
			$data['message_type'] = 'text';
		}

		// Set is_edited default
		if (!isset($data['is_edited'])) {
			$data['is_edited'] = 0;
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

		// Add sender information
		$data->sender = $this->getSender($data->sender_id);

		// Format timestamps
		$data->time = $data->created_at;
		$data->direction = $this->getDirection($data->sender_id);

		// Add audio info if audio message
		if ($data->message_type === 'audio' && $data->file_url) {
			$data->audioUrl = $data->file_url;
			$data->audioDuration = $data->audio_duration;
		}

		return $data;
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
		return $this->belongsTo('\Modules\User\Models\User', 'sender_id');
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
		$storage = static::storage();
		$sql = $storage->table(static::$tableName)
			->select()
			->where(['conversation_id' => $conversationId])
			->orderBy('created_at ASC')
			->limit($limit)
			->offset($offset);

		return $storage->fetch($sql);
	}

	/**
	 * Mark messages as read for a user.
	 *
	 * @param int $conversationId
	 * @param int $userId
	 * @return bool
	 */
	public static function markAsRead(int $conversationId, int $userId): bool
	{
		$storage = static::storage();

		// Update messages read_at timestamp
		$sql = $storage->table('messages')
			->update([
				'read_at' => date('Y-m-d H:i:s')
			])
			->where([
				'conversation_id' => $conversationId,
				'sender_id !=' => $userId,
				'read_at' => null
			]);

		$storage->execute($sql);

		// Update participant's last_read_at
		$participantSql = $storage->table('conversation_participants')
			->update([
				'last_read_at' => date('Y-m-d H:i:s')
			])
			->where([
				'conversation_id' => $conversationId,
				'user_id' => $userId
			]);

		return $storage->execute($participantSql);
	}

	/**
	 * Get sender information.
	 *
	 * @param int $senderId
	 * @return object|null
	 */
	private function getSender(int $senderId): ?object
	{
		// This would use the User model
		$storage = static::storage();
		$sql = $storage->table('users')
			->select(['id', 'first_name', 'last_name', 'email', 'avatar'])
			->where(['id' => $senderId]);

		$users = $storage->fetch($sql);
		return $users[0] ?? null;
	}

	/**
	 * Determine message direction based on current user.
	 *
	 * @param int $senderId
	 * @return string
	 */
	private function getDirection(int $senderId): string
	{
		// This would get current user ID from auth
		$currentUserId = 1; // Placeholder
		return ($senderId === $currentUserId) ? 'sent' : 'received';
	}
}