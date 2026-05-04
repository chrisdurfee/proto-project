<?php declare(strict_types=1);
namespace Modules\User\Follower\Models;

use Proto\Models\PivotModel;
use Modules\User\Main\Models\User;

/**
 * FollowerUser
 *
 * This is the model class for the pivot table "follower_users".
 *
 * @package Modules\User\Models
 */
class FollowerUser extends PivotModel
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'follower_users';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'fu';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'followerUserId'
	];

	/**
	 * @var array<string> $immutableFields fields that cannot change after creation
	 */
	protected static array $immutableFields = ['userId', 'followerUserId', 'createdAt'];

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
				fields: ['id', 'displayName', 'image', 'username', 'status', 'verified']
			)
			->on(['followerUserId', 'id']);
	}

	/**
	 * Check if a follower relationship exists.
	 *
	 * Uses the query builder directly to avoid the eager JOIN to `users` which
	 * would silently drop rows when the related user record is missing or soft-deleted,
	 * causing incorrect results in toggle/count logic.
	 *
	 * @param mixed $userId
	 * @param mixed $followerId
	 * @return bool
	 */
	public static function isAdded(mixed $userId, mixed $followerId): bool
	{
		$row = static::builder()
			->select()
			->where('user_id = ?', 'follower_user_id = ?')
			->first([(int)$userId, (int)$followerId]);
		return $row !== null;
	}
}