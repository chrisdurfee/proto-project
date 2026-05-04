<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Common\Seeders\SystemUserSeeder;

/**
 * SystemUserReseed
 *
 * Re-runs the SystemUserSeeder now that the users.status enum
 * includes the 'system' value. The seeder is idempotent — it skips
 * if rally-bot already exists.
 */
class SystemUserReseed extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->runSeeder(SystemUserSeeder::class);
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		// Seeder records are not reversed; manual cleanup if required.
	}
}
