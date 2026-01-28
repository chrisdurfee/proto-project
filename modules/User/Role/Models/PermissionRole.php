<?php declare(strict_types=1);
namespace Modules\User\Role\Models;

use Proto\Models\Model;

/**
 * PermissionRole
 *
 * This is the model class for the pivot table "permission_roles".
 *
 * @package Modules\User\Models
 */
class PermissionRole extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'permission_roles';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'pr';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'roleId',
		'permissionId',
		'createdAt',
		'updatedAt'
	];

	/**
	 * Define joins for the Permission model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		Role::many($builder)
			->on(['roleId', 'id'])
			->fields(
				'id',
				'name',
				'slug',
				'description'
			);
	}

	/**
	 * This will delete a role permission by the roleId and permissionId.
	 *
	 * @param mixed $roleId
	 * @param mixed $permissionId
	 * @return bool
	 */
	public function deleteRolePermission(mixed $roleId, mixed $permissionId): bool
	{
		return static::builder()
			->delete()
			->where(
				['role_id', $roleId],
				['permission_id', $permissionId]
			)
			->execute();
	}
}