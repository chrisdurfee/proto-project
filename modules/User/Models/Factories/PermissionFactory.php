<?php declare(strict_types=1);
namespace Modules\User\Models\Factories;

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
		$actions = ['create', 'read', 'update', 'delete', 'manage'];
		$resources = ['user', 'post', 'product', 'order', 'report'];
		$modules = ['User', 'Content', 'Product', 'Order', 'Report', 'Admin'];

		$action = $actions[$this->faker()->numberBetween(0, count($actions) - 1)];
		$resource = $resources[$this->faker()->numberBetween(0, count($resources) - 1)];
		$module = $modules[$this->faker()->numberBetween(0, count($modules) - 1)];
		$name = ucfirst($action) . ' ' . ucfirst($resource);
		$uniqueId = $this->faker()->numberBetween(1000, 9999);

		return [
			'name' => $name,
			'slug' => strtolower($action . '-' . $resource . '-' . $uniqueId),
			'description' => "Permission to {$action} {$resource} records",
			'module' => $module,
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
