<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * UserStatusSystem
 *
 * Adds the 'system' status to the users.status enum so that
 * system/bot accounts (e.g. proto-bot) can be identified distinctly
 * from regular user presence states.
 */
class UserStatusSystem extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->alter('users', function($table)
		{
			$table->alter('status')->enum('online', 'offline', 'busy', 'away', 'system')->default("'offline'");
		});
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->alter('users', function($table)
		{
			$table->alter('status')->enum('online', 'offline', 'busy', 'away')->default("'offline'");
		});
	}
}
