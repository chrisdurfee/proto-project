<?php declare(strict_types=1);
namespace Modules\Tracking\Models;

use Proto\Models\Model;
use Modules\User\Models\User;

/**
 * Activity
 *
 * @package Modules\Tracking\Models
 */
class Activity extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'activity';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'a';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'type',
		'userId',
		'refId'
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
				fields: ['id', 'displayName', 'firstName', 'lastName', 'image']
			)
			->on(['userId', 'id']);
	}

	/**
	 * Get an activity by type and reference ID.
	 *
	 * @param string $type
	 * @param mixed $refId
	 * @return array
	 */
	public static function getByType(string $type, mixed $refId = null): array
	{
		$filter = [
			['type', $type]
		];

		if (isset($refId))
		{
			$filter[] = ['ref_id', $refId];
		}

		return static::fetchWhere($filter);
	}

	/**
	 * This will delete a user activity by the userId and activityId.
	 *
	 * @param string $type
	 * @param mixed $refId
	 * @param mixed $userId
	 * @return bool
	 */
	public function deleteUserByType(string $type, mixed $refId, mixed $userId): bool
	{
		if (!$type || !isset($refId) || !isset($userId))
		{
			return false;
		}

		return $this->storage
			->table()
			->delete()
			->where('type = ?', 'ref_id = ?', 'user_id = ?')
			->limit(1)
			->execute([$type, $refId, $userId]);
	}
}