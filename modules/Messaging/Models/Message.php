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
	 * @var string|null $alias
	 */
    protected static ?string $alias = 'm';

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