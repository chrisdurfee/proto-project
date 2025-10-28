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
	protected static function augment(mixed $data = null): mixed
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
	protected static function format(?object $data): ?object
	{
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
				'u.first_name as creatorFirstName',
				'u.last_name as creatorLastName',
				'u.email as creatorEmail',
				'p.last_read_at as lastReadAt'
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