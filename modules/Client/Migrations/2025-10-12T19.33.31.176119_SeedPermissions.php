<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * SeedPermissions
 *
 */
class SeedPermissions extends Migration
{
	/**
	 * @var string $connection
	 */
	protected string $connection = 'default';

	/**
	 * Runs the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{

	}

	/**
	 * Seed the database with partner roles.
	 *
	 * @return void
	 */
	public function seed(): void
	{
		// 1) create the client permissions
		$permissions = [
			[
				'name' => 'Create Clients',
				'slug' => 'client.create',
				'description' => 'Can create clients',
				'module' => 'client',
			],
			[
				'name' => 'View Clients',
				'slug' => 'client.view',
				'description' => 'Can view clients',
				'module' => 'client',
			],
			[
				'name' => 'Edit Clients',
				'slug' => 'client.edit',
				'description' => 'Can edit clients',
				'module' => 'client',
			],
			[
				'name' => 'Delete Clients',
				'slug' => 'client.delete',
				'description' => 'Can delete clients',
				'module' => 'client',
			],
			[
				'name' => 'Create Client Contacts',
				'slug' => 'client.contact.create',
				'description' => 'Can create client contacts',
				'module' => 'client',
			],
			[
				'name' => 'View Client Contacts',
				'slug' => 'client.contact.view',
				'description' => 'Can view client contacts',
				'module' => 'client',
			],
			[
				'name' => 'Edit Client Contacts',
				'slug' => 'client.contact.edit',
				'description' => 'Can edit client contacts',
				'module' => 'client',
			],
			[
				'name' => 'Delete Client Contacts',
				'slug' => 'client.contact.delete',
				'description' => 'Can delete client contacts',
				'module' => 'client',
			],
		];

		foreach ($permissions as $permission)
		{
			$this->insert('permissions', $permission);
		}

		// 2) fetch the role IDs for 'admin' and 'manager'
		$adminRoleId = $this->first(
			'SELECT id FROM roles WHERE slug = ?',
			['admin']
		)->id;

		$managerRoleId = $this->first(
			'SELECT id FROM roles WHERE slug = ?',
			['manager']
		)->id;

		// 3) assign every new client permission to both roles
		$slugs = array_column($permissions, 'slug');
		foreach ($slugs as $slug)
		{
			$permId = $this->first(
				'SELECT id FROM permissions WHERE slug = ?',
				[$slug]
			)->id;

			$this->insert('permission_roles', [
				'role_id' => $adminRoleId,
				'permission_id' => $permId,
			]);

			$this->insert('permission_roles', [
				'role_id' => $managerRoleId,
				'permission_id' => $permId,
			]);
		}
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{

	}
}