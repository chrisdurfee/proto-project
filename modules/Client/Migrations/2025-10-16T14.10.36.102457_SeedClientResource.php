<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * SeedClientResource
 *
 * Seeds client.resource permissions and assigns them to roles.
 */
class SeedClientResource extends Migration
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
		// no schema changes
	}

	/**
	 * Seed the database with client.resource permissions and role assignments.
	 *
	 * @return void
	 */
	public function seed(): void
	{
		// 1) Ensure permissions exist (idempotent)
		$permissions = [
			[
				'name' => 'Create Client Resources',
				'slug' => 'client.resource.create',
				'description' => 'Can create client resources',
				'module' => 'client',
			],
			[
				'name' => 'View Client Resources',
				'slug' => 'client.resource.view',
				'description' => 'Can view client resources',
				'module' => 'client',
			],
			[
				'name' => 'Edit Client Resources',
				'slug' => 'client.resource.edit',
				'description' => 'Can edit client resources',
				'module' => 'client',
			],
			[
				'name' => 'Delete Client Resources',
				'slug' => 'client.resource.delete',
				'description' => 'Can delete client resources',
				'module' => 'client',
			],
		];

		foreach ($permissions as $permission)
		{
			$existing = $this->first('SELECT id FROM permissions WHERE slug = ?', [$permission['slug']]);
			if (!$existing)
			{
                // Insert only if missing
				$this->insert('permissions', $permission);
			}
		}

		// 2) Resolve permission IDs by slug
		$permIds = [];
		foreach ($permissions as $p)
		{
			$row = $this->first('SELECT id FROM permissions WHERE slug = ?', [$p['slug']]);
			if ($row && isset($row->id))
			{
				$permIds[$p['slug']] = (int) $row->id;
			}
		}

		// 3) Resolve role IDs (skip silently if a role doesn't exist)
		$roles = ['admin', 'manager', 'editor', 'contributor'];
		$roleIds = [];
		foreach ($roles as $roleSlug)
		{
			$role = $this->first('SELECT id FROM roles WHERE slug = ?', [$roleSlug]);
			if ($role && isset($role->id))
			{
				$roleIds[$roleSlug] = (int) $role->id;
			}
		}

		// 4) Define which actions each role receives
		// Note: "contributor: view, add" -> treat "add" as "create" to match action naming
		$roleActions = [
			'admin' => ['client.resource.create', 'client.resource.view', 'client.resource.edit', 'client.resource.delete'],
			'manager' => ['client.resource.create', 'client.resource.edit', 'client.resource.delete', 'client.resource.view'],
			'editor' => ['client.resource.create', 'client.resource.edit', 'client.resource.view'],
			'contributor' => ['client.resource.view', 'client.resource.create'],
		];

		// 5) Assign permissions to roles (idempotent)
		foreach ($roleActions as $roleSlug => $slugs)
		{
			if (!isset($roleIds[$roleSlug]))
			{
				continue; // role missing; nothing to do
			}

			$roleId = $roleIds[$roleSlug];

			foreach ($slugs as $slug)
			{
				if (!isset($permIds[$slug]))
				{
					continue; // permission missing (shouldn't happen)
				}

				$permId = $permIds[$slug];

				$exists = $this->first(
					'SELECT id FROM permission_roles WHERE role_id = ? AND permission_id = ?',
					[$roleId, $permId]
				);

				if (!$exists)
				{
					$this->insert('permission_roles', [
						'role_id' => $roleId,
						'permission_id' => $permId,
					]);
				}
			}
		}
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		// Intentionally left blank; remove manually if necessary.
	}
}