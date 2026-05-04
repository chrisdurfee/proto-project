<?php declare(strict_types=1);

namespace Modules\Notification\Models;

use Proto\Models\Model;
use Proto\Storage\DataTypes\JsonType;
use Modules\Notification\Models\Factories\UserNotificationFactory;

/**
 * UserNotification Model
 *
 * Represents a notification item in a user's activity inbox.
 *
 * @method static UserNotificationFactory factory(int $count = 1, array $attributes = [])
 *
 * @package Modules\Notification\Models
 */
class UserNotification extends Model
{
	/**
	 * @var string|null $factory The factory class name.
	 */
	protected static ?string $factory = UserNotificationFactory::class;

	/**
	 * @var string|null $tableName The database table name.
	 */
	protected static ?string $tableName = 'user_notifications';

	/**
	 * @var string|null $alias The table alias.
	 */
	protected static ?string $alias = 'un';

	/**
	 * @var array $fields The model fields.
	 */
	protected static array $fields = [
		'id',
		'uuid',
		'userId',
		'type',
		'category',
		'priority',
		'title',
		'description',
		'iconName',
		'primaryAction',
		'secondaryAction',
		'statusBadge',
		'metadata',
		'refId',
		'refType',
		'isRead',
		'readAt',
		'createdAt',
		'updatedAt',
		'deletedAt'
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['userId', 'type', 'category', 'refId', 'refType', 'createdAt'];

	/**
	 * @var array $dataTypes Custom data type handlers.
	 */
	protected static array $dataTypes = [
		'statusBadge' => JsonType::class,
		'metadata' => JsonType::class
	];

	/**
	 * Pre-persist hook: coerce empty-string JSON fields to null so the
	 * MariaDB CHECK (JSON_VALID) constraint is not violated.
	 *
	 * @param mixed $data
	 * @return mixed
	 */
	protected static function augment(mixed $data = null): mixed
	{
		if ($data)
		{
			foreach (array_keys(static::$dataTypes) as $field)
			{
				if (isset($data->{$field}) && $data->{$field} === '')
				{
					$data->{$field} = null;
				}
			}
		}

		return $data;
	}

	/**
	 * Post-fetch hook: cast fields for API output.
	 *
	 * @param object|null $data
	 * @return object|null
	 */
	protected static function format(?object $data): ?object
	{
		if (!$data)
		{
			return null;
		}

		$data->isRead = (bool)$data->isRead;
		$data->id = (int)$data->id;
		$data->userId = (int)$data->userId;

		if (isset($data->refId))
		{
			$data->refId = (int)$data->refId;
		}

		return $data;
	}

	/**
	 * Fetch a paginated list of notifications for a user.
	 *
	 * @param int $userId
	 * @param string|null $category
	 * @param int $offset
	 * @param int $limit
	 * @return array
	 */
	public static function getForUser(int $userId, ?string $category = null, int $offset = 0, int $limit = 20): array
	{
		$sql = static::builder()
			->select()
			->where('un.user_id = ?', 'un.deleted_at IS NULL')
			->orderBy('un.created_at DESC')
			->limit($offset, $limit);

		$params = [$userId];

		if ($category && $category !== 'all')
		{
			$sql->where('un.category = ?');
			$params[] = $category;
		}

		return $sql->fetch($params);
	}

	/**
	 * Count unread notifications for a user.
	 *
	 * @param int $userId
	 * @return int
	 */
	public static function getUnreadCount(int $userId): int
	{
		$result = static::builder()
			->select([['COUNT(*)'], 'total'])
			->where('un.user_id = ?', 'un.is_read = 0', 'un.deleted_at IS NULL')
			->first([$userId]);

		return isset($result->total) ? (int)$result->total : 0;
	}

	/**
	 * Mark all notifications as read for a user.
	 *
	 * @param int $userId
	 * @return bool
	 */
	public static function markAllReadForUser(int $userId): bool
	{
		return static::builder()
			->update()
			->set([
				'is_read' => 1,
				'read_at' => date('Y-m-d H:i:s')
			])
			->where('user_id = ?', 'is_read = 0', 'deleted_at IS NULL')
			->execute([$userId]);
	}

	/**
	 * Fetch recent unread notifications suitable for feed assistant cards.
	 *
	 * Returns up to $limit unread, non-dismissed notifications whose
	 * category matches the "card-worthy" set (offers, maintenance, events, updates).
	 *
	 * @param int $userId
	 * @param int $limit
	 * @return array
	 */
	public static function getFeedCards(int $userId, int $limit = 10): array
	{
		$rows = static::builder()
			->select()
			->where(
				'un.user_id = ?',
				'un.is_read = 0',
				'un.deleted_at IS NULL',
				"un.category IN ('offers', 'maintenance', 'events', 'updates')"
			)
			->orderBy('un.created_at DESC')
			->limit(0, $limit)
			->fetch([$userId]);

		$instance = new static();
		$rows = $instance->convertRows($rows);
		return $rows;
	}
}
