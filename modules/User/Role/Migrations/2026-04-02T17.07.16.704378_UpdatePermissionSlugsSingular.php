<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * UpdatePermissionSlugsSingular
 *
 * Updates permission slugs from plural to singular form.
 * e.g., users.view → user.view, roles.edit → role.edit
 */
class UpdatePermissionSlugsSingular extends Migration
{
	/**
	 * Map of old slug => new slug.
	 *
	 * @var array<string,string>
	 */
	protected array $slugMap = [
		'users.view' => 'user.view',
		'users.create' => 'user.create',
		'users.edit' => 'user.edit',
		'users.delete' => 'user.delete',
		'roles.view' => 'role.view',
		'roles.create' => 'role.create',
		'roles.edit' => 'role.edit',
		'roles.delete' => 'role.delete',
		'permissions.view' => 'permission.view',
		'permissions.assign' => 'permission.assign',
		'groups.view' => 'group.view',
		'groups.create' => 'group.create',
		'groups.edit' => 'group.edit',
		'groups.delete' => 'group.delete',
	];

	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		foreach ($this->slugMap as $old => $new)
		{
			$this->execute(
				"UPDATE permissions SET slug = ? WHERE slug = ?",
				[$new, $old]
			);
		}
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		foreach ($this->slugMap as $old => $new)
		{
			$this->execute(
				"UPDATE permissions SET slug = ? WHERE slug = ?",
				[$old, $new]
			);
		}
	}
}
