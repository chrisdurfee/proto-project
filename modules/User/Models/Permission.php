<?php declare(strict_types=1);
namespace Modules\User\Models;

use Proto\Models\Model;
use Proto\Models\Relations;

/**
 * Permission
 *
 * This is the model class for table "permissions".
 *
 * @package Modules\User\Models
 */
class Permission extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'permissions';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'p';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'name',
		'slug',
		'description',
		'module',
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
		$builder
			->belongsToMany(Role::class, [
				'id',
				'name',
				'slug',
				'description'
			]);
	}

	/**
	 * Retrieve the roles associated with this permission.
	 *
	 * @return Relations\BelongsToMany
	 */
	public function roles(): Relations\BelongsToMany
	{
		return $this->belongsToMany(Role::class);
	}
}