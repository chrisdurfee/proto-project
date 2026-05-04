<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * AddAchievementToUserNotifications
 *
 * Adds 'achievement' to the type and category enum columns
 * so the achievement module can log notifications.
 */
class AddAchievementToUserNotifications extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->alter('user_notifications', function($table)
		{
			$table->alter('type')->enum('type', 'garage', 'offers_users', 'offers_partners', 'market', 'upcoming', 'social', 'updates', 'achievement');
			$table->alter('category')->enum('category', 'maintenance', 'offers', 'social', 'market', 'events', 'updates', 'partners', 'achievement');
		});
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->alter('user_notifications', function($table)
		{
			$table->alter('type')->enum('type', 'garage', 'offers_users', 'offers_partners', 'market', 'upcoming', 'social', 'updates');
			$table->alter('category')->enum('category', 'maintenance', 'offers', 'social', 'market', 'events', 'updates', 'partners');
		});
	}
}
