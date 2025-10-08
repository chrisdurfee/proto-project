<?php declare(strict_types=1);
namespace Modules\User\Models;

use Proto\Models\Model;

/**
 * Organization
 *
 * This is the model class for the table "organizations".
 *
 * @package Modules\User\Models
 */
class Organization extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'organizations';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'o';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'name'
	];

	/**
	 * Define joins for the Role model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		// Commented out to prevent circular dependency with User model
		// User->joins() loads Organization, Organization->joins() loads User = deadlock
		// TODO: Refactor to use lazy loading or one-way relationship
		// $builder
		// 	->belongsToMany(User::class);
	}
}