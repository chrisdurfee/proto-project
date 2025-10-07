<?php declare(strict_types=1);
namespace Modules\User\Factories;

use Proto\Models\Factory;
use Modules\User\Models\Permission;

/**
 * PermissionFactory
 *
 * Factory for generating Permission model test data.
 *
 * @package Modules\User\Factories
 */
class PermissionFactory extends Factory
{
	/**
	 * The model this factory creates
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return Permission::class;
	}

	/**
	 * Define the model's default state
	 *
	 * @return array
	 */
	public function definition(): array
	{
		$action = $this->faker()->randomElement(['create', 'read', 'update', 'delete', 'manage']);
		$resource = $this->faker()->randomElement(['user', 'post', 'product', 'order', 'report']);
		$name = ucfirst($action) . ' ' . ucfirst($resource);

		return [
			'name' => $name,
			'slug' => strtolower($action . '-' . $resource),
			'description' => "Permission to {$action} {$resource} records",
			'module' => ucfirst($resource),
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		];
	}

	/**
	 * Define a user management permission state
	 *
	 * @return array
	 */
	public function stateUserManage(): array
	{
		return [
			'name' => 'Manage Users',
			'slug' => 'manage-users',
			'description' => 'Full access to manage user accounts',
			'module' => 'User'
		];
	}

	/**
	 * Define a content management permission state
	 *
	 * @return array
	 */
	public function stateContentManage(): array
	{
		return [
			'name' => 'Manage Content',
			'slug' => 'manage-content',
			'description' => 'Full access to manage content',
			'module' => 'Content'
		];
	}

	/**
	 * Define a view only permission state
	 *
	 * @return array
	 */
	public function stateViewOnly(): array
	{
		return [
			'name' => 'View Reports',
			'slug' => 'view-reports',
			'description' => 'Read-only access to view reports',
			'module' => 'Report'
		];
	}

	/**
	 * State with custom module
	 *
	 * @param string $module
	 * @return array
	 */
	public function stateWithModule(string $module): array
	{
		return [
			'module' => $module
		];
	}
}
