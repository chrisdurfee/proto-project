<?php declare(strict_types=1);
namespace Modules\Tracking\UserActivity\Models;

use Proto\Models\Model;
use Modules\Tracking\UserActivity\Models\Factories\UserActivityLogFactory;

/**
 * UserActivityLog
 *
 * Stores a denormalized, human-readable log of recent user actions
 * for display on the profile page.
 *
 * @method static UserActivityLogFactory factory(int $count = 1, array $attributes = [])
 * @package Modules\Tracking\UserActivity\Models
 */
class UserActivityLog extends Model
{
	/**
	 * @var string|null $factory
	 */
	protected static ?string $factory = UserActivityLogFactory::class;

	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'user_activity_log';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ual';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'userId',
		'action',
		'title',
		'description',
		'refId',
		'refType',
		'createdAt',
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['userId', 'action', 'refId', 'refType', 'createdAt'];

	/**
	 * Fetch the most recent activity entries for a user, ordered by newest first.
	 *
	 * @param int $userId
	 * @param int $limit
	 * @return array
	 */
	public static function getRecentForUser(int $userId, int $limit = 20): array
	{
		return static::builder()
			->select()
			->where('user_id = ?')
			->orderBy('created_at DESC')
			->limit(0, $limit)
			->fetch([$userId]);
	}
}
