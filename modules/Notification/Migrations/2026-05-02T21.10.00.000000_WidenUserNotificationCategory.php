<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * WidenUserNotificationCategory
 *
 * Converts `category` from ENUM to VARCHAR so notification producers cannot
 * trip "Data truncated" when the column definition lags new categories or when
 * driver / alias drift causes unexpected values.
 */
class WidenUserNotificationCategory extends Migration
{
	public function up(): void
	{
		$this->execute(
			'ALTER TABLE user_notifications
			MODIFY COLUMN category VARCHAR(64) NOT NULL DEFAULT \'updates\''
		);
	}

	public function down(): void
	{
		$this->execute(
			"UPDATE user_notifications SET category = 'updates' WHERE category NOT IN " .
			"('maintenance', 'offers', 'social', 'market', 'events', 'updates', 'partners', 'achievement')"
		);

		$this->alter('user_notifications', function($table)
		{
			$table->alter('category')->enum(
				'maintenance',
				'offers',
				'social',
				'market',
				'events',
				'updates',
				'partners',
				'achievement'
			)->default("'updates'");
		});
	}
}
