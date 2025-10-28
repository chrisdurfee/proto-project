<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

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
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'title',
		'type',
		'description',
		'lastMessageAt',
		'lastMessageId',
		'createdBy',
		'createdAt',
		'updatedAt'
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
		if (!$data)
        {
			return $data;
		}

		// Ensure type defaults to 'direct'
		if (!isset($data->type) || empty($data->type))
        {
			$data->type = 'direct';
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
		if (!$data)
        {
			return null;
		}

		// Add computed fields
		$data->unreadCount = $this->getUnreadCount($data->id);
		$data->participantCount = $this->getParticipantCount($data->id);
		$data->lastMessage = $this->getLastMessage($data->id);

		return $data;
	}

	/**
	 * Get messages for this conversation.
	 *
	 * @return mixed
	 */
	public function messages()
	{
		return $this->hasMany(Message::class, 'conversation_id');
	}

	/**
	 * Get participants for this conversation.
	 *
	 * @return mixed
	 */
	public function participants()
	{
		return $this->hasMany(ConversationParticipant::class, 'conversation_id');
	}

	/**
	 * Get the creator of this conversation.
	 *
	 * @return mixed
	 */
	public function creator()
	{
		return $this->belongsTo('\Modules\User\Models\User', 'created_by');
	}

	/**
	 * Get unread message count for current user.
	 *
	 * @param int $conversationId
	 * @return int
	 */
	private function getUnreadCount(int $conversationId): int
	{
		// This would typically get the current user's ID from auth
		$userId = 1; // Placeholder for current user

		$participant = ConversationParticipant::getBy([
			'conversation_id' => $conversationId,
			'user_id' => $userId
		]);

		if (!$participant)
        {
			return 0;
		}

		$lastReadAt = $participant->last_read_at ?? '1970-01-01 00:00:00';

		return count(Message::fetchWhere([
			'conversation_id' => $conversationId,
			"created_at > '{$lastReadAt}'"
		]));
	}

	/**
	 * Get participant count for this conversation.
	 *
	 * @param int $conversationId
	 * @return int
	 */
	private function getParticipantCount(int $conversationId): int
	{
		return count(ConversationParticipant::fetchWhere([
			'conversation_id' => $conversationId,
			'is_active' => 1
		]));
	}

	/**
	 * Get the last message in this conversation.
	 *
	 * @param int $conversationId
	 * @return object|null
	 */
	private function getLastMessage(int $conversationId): ?object
	{
		$storage = static::storage();
		$sql = $storage->table('messages')
			->select()
			->where(['conversation_id' => $conversationId])
			->orderBy('created_at DESC')
			->limit(1);

		$messages = $storage->fetch($sql);
		return $messages[0] ?? null;
	}

	/**
	 * Get conversations for a specific user.
	 *
	 * @param int $userId
	 * @return array
	 */
	public static function getForUser(int $userId): array
	{
		$storage = static::storage();

		$sql = $storage->table('conversations', 'c')
			->select([
				'c.*',
				'u.first_name',
				'u.last_name',
				'u.email',
				'p.last_read_at'
			])
			->join('conversation_participants p', 'c.id = p.conversation_id')
			->join('users u', 'c.created_by = u.id')
			->where([
				'p.user_id' => $userId,
				'p.is_active' => 1
			])
			->orderBy('c.last_message_at DESC');

		return $storage->fetch($sql);
	}
}