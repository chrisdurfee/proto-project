<?php declare(strict_types=1);
namespace Modules\User\Permission\Models;

use Proto\Models\Model;
use Proto\Models\Relations;
use Modules\User\Role\Models\Role;
use Modules\User\Permission\Models\Factories\PermissionFactory;

/**
 * Permission
 *
 * This is the model class for table "permissions".
 *
 * @method static PermissionFactory factory(int $count = 1, array $attributes = [])
 *
 * @package Modules\User\Models
 */
class Permission extends Model
{
	/**
	 * @var string|null $factory the factory class name (IDE hint only — HasFactory resolves by naming convention)
	 */
	protected static ?string $factory = PermissionFactory::class;

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