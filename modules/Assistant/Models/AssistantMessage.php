<?php declare(strict_types=1);
namespace Modules\Assistant\Models;

use Modules\User\Models\User;
use Proto\Models\Model;

/**
 * AssistantMessage Model
 *
 * @package Modules\Assistant\Models
 */
class AssistantMessage extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'assistant_messages';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'am';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'conversationId',
		'userId',
		'role',
		'content',
		'type',
		'isStreaming',
		'isComplete',
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
				AssistantConversation::class,
				fields: ['title']
			)
			->on(['conversation_id', 'id']);

		$builder
			->one(
				User::class,
				fields: ['displayName', 'firstName', 'lastName', 'email', 'image']
			)
			->on(['user_id', 'id']);
	}

	/**
	 * Get the conversation this message belongs to.
	 *
	 * @return mixed
	 */
	public function conversation()
	{
		return $this->belongsTo(AssistantConversation::class, 'conversation_id');
	}

	/**
	 * Get the user who sent this message.
	 *
	 * @return mixed
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id');
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
		return static::builder()
			->select(['am.*'])
			->where(
				['am.conversation_id', $conversationId],
				'am.deleted_at IS NULL'
			)
			->orderBy('am.created_at DESC')
			->limit($limit)
			->offset($offset)
			->fetch();
	}

	/**
	 * Sync messages for a conversation - gets new, updated, and deleted messages.
	 *
	 * @param int $conversationId
	 * @param string|null $lastSync The last sync timestamp
	 * @return array Array with 'merge' and 'deleted' messages
	 */
	public static function sync(int $conversationId, ?string $lastSync = null): array
	{
		$result = [
			'merge' => [],
			'deleted' => []
		];

		// Get newly created and updated messages
		$sql = static::where([
			['am.conversation_id', $conversationId],
			'am.deleted_at IS NULL'
		]);

		if (!empty($lastSync))
		{
			$sql->orWhere(
				"am.created_at >= '{$lastSync}'",
				"am.updated_at >= '{$lastSync}'"
			);
		}

		$sql->orderBy('am.created_at ASC');
		$messages = $sql->fetch();

		$model = new static();
		$result['merge'] = $model->convertRows($messages);

		// Get deleted messages (soft-deleted after last sync)
		if (!empty($lastSync))
		{
			$deletedMessages = static::builder()
				->select(['am.id'])
				->where(
					['am.conversation_id', $conversationId],
					"am.deleted_at >= '{$lastSync}'"
				)
				->fetch();

			$result['deleted'] = $model->convertRows($deletedMessages);
		}

		return $result;
	}

	/**
	 * Get conversation history formatted for OpenAI API.
	 *
	 * @param int $conversationId
	 * @param int $limit
	 * @return array
	 */
	public static function getConversationHistory(int $conversationId, int $limit = 20): array
	{
		$messages = static::builder()
			->select(['am.role'], ['am.content'])
			->where(
				['am.conversation_id', $conversationId],
				'am.deleted_at IS NULL',
				"am.is_complete = 1"
			)
			->orderBy('am.created_at ASC')
			->limit($limit)
			->fetch();

		$history = [];
		foreach ($messages as $message)
		{
			$history[] = [
				'role' => $message->role,
				'content' => $message->content
			];
		}

		return $history;
	}

	/**
	 * Touch the message to update its updatedAt timestamp.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	public static function touch(int $messageId): bool
	{
		return static::edit((object)[
			'id' => $messageId,
			'updatedAt' => date('Y-m-d H:i:s')
		]);
	}
}
