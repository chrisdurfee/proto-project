<?php declare(strict_types=1);
namespace Modules\User\Organization\Models;

use Proto\Models\PivotModel;

/**
 * OrganizationUser
 *
 * This is the model class for the pivot table "organization_user".
 *
 * @package Modules\User\Models
 */
class OrganizationUser extends PivotModel
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'organization_users';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ou';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'organizationId'
	];

	/**
	 * @var array<string> $immutableFields fields that cannot change after creation
	 */
	protected static array $immutableFields = ['userId', 'organizationId', 'createdAt'];

	/**
	 * Define joins for the organization user model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		$builder->one(Organization::class)
			->on(['organizationId', 'id'])
			->fields(
				['name', 'organizationName']
			);
	}
}