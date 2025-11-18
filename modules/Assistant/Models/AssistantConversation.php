<?php declare(strict_types=1);
namespace Modules\Assistant\Models;

use Modules\User\Models\User;
use Proto\Models\Model;

/**
 * AssistantConversation Model
 *
 * @package Modules\Assistant\Models
 */
class AssistantConversation extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'assistant_conversations';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ac';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'title',
		'description',
		'lastMessageAt',
		'lastMessageId',
		'lastMessageContent',
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
				fields: ['displayName', 'firstName', 'lastName', 'email', 'image']
			)
			->on(['user_id', 'id']);
	}

	/**
	 * Get messages for this conversation.
	 *
	 * @return mixed
	 */
	public function messages()
	{
		return $this->hasMany(AssistantMessage::class, 'conversation_id');
	}

	/**
	 * Get the user who owns this conversation.
	 *
	 * @return mixed
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id');
	}

	/**
	 * Get or create a conversation for a user.
	 * Returns the most recent active conversation or creates a new one.
	 *
	 * @param int $userId
	 * @return object|null
	 */
	public static function getOrCreateForUser(int $userId): ?object
	{
		$conversation = static::builder()
			->select(['ac.*'])
			->where(
				['ac.user_id', $userId],
				'ac.deleted_at IS NULL'
			)
			->orderBy('ac.last_message_at DESC, ac.id DESC')
			->first();

		if ($conversation)
		{
			return $conversation;
		}

		$model = new static((object)[
			'userId' => $userId,
			'title' => 'New Chat',
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		]);

		$result = $model->add();
		if (!$result)
		{
			return null;
		}

		return static::get((int)$model->id);
	}

	/**
	 * Get conversations for a specific user.
	 *
	 * @param int $userId
	 * @return array
	 */
	public static function getForUser(int $userId): array
	{
		return static::builder()
			->select(['ac.*'])
			->where(
				['ac.user_id', $userId],
				'ac.deleted_at IS NULL'
			)
			->orderBy('ac.last_message_at DESC, ac.id DESC')
			->fetch();
	}

	/**
	 * Update the last message data for a conversation.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @param string $content
	 * @return bool
	 */
	public static function updateLastMessage(
		int $conversationId,
		int $messageId,
		string $content
	): bool
	{
		return static::edit((object)[
			'id' => $conversationId,
			'lastMessageId' => $messageId,
			'lastMessageContent' => substr($content, 0, 500),
			'lastMessageAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * Sync conversations for a user - gets new and updated conversations.
	 *
	 * @param int $userId
	 * @param string|null $lastSync The last sync timestamp
	 * @return array Array with 'merge' and 'deleted' conversations
	 */
	public static function sync(int $userId, ?string $lastSync = null): array
	{
		$result = [
			'merge' => [],
			'deleted' => []
		];

		$sql = static::where([
			['ac.user_id', $userId],
			'ac.deleted_at IS NULL'
		]);

		if (!empty($lastSync))
		{
			$sql->orWhere(
				"ac.updated_at >= '{$lastSync}'",
				"ac.created_at >= '{$lastSync}'"
			);
		}

		$sql->orderBy('ac.last_message_at DESC, ac.id DESC');
		$conversations = $sql->fetch();

		if (empty($conversations))
		{
			return $result;
		}

		$model = new static();
		$result['merge'] = $model->convertRows($conversations);

		return $result;
	}
}
