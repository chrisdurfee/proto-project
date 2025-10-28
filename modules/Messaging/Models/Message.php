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
		'conversationId',
		'senderId',
		'content',
		'messageType',
		'fileUrl',
		'fileName',
		'fileSize',
		'audioDuration',
		'isEdited',
		'editedAt',
		'readAt',
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
	 * @param mixed $data
	 * @return mixed
	 */
	protected static function augment(mixed $data = null): mixed
	{
		if (!$data)
		{
			return $data;
		}

		// Ensure messageType defaults to 'text'
		if (!isset($data->messageType) || empty($data->messageType))
		{
			$data->messageType = 'text';
		}

		// Set isEdited default
		if (!isset($data->isEdited))
		{
			$data->isEdited = 0;
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
	 * @return array
	 */
	public static function getForConversation(int $conversationId, int $limit = 50): array
	{
		// Use fetchWhere for simple queries
		$messages = static::fetchWhere(['conversationId' => $conversationId]);

		// Sort by createdAt and limit
		usort($messages, fn($a, $b) => strtotime($a->createdAt) - strtotime($b->createdAt));

		return array_slice($messages, 0, $limit);
	}
}