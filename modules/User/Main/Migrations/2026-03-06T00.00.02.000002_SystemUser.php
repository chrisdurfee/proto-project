<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Common\Seeders\SystemUserSeeder;

/**
 * Migration to seed the Rally Bot system user.
 */
class SystemUser extends Migration
{
	/**
	 * Runs the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		// No schema changes — table already exists.
	}

	/**
	 * Seeds the Rally Bot system user.
	 *
	 * @return void
	 */
	public function seed(): void
	{
		$this->runSeeder(SystemUserSeeder::class);
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		// No schema to revert.
	}
}
