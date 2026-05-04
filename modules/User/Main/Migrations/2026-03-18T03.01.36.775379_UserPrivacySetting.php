<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * UserPrivacySetting
 *
 * Creates the user_privacy_settings table to store per-user privacy preferences.
 */
class UserPrivacySetting extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->create('user_privacy_settings', function($table)
		{
			$table->integer('user_id', 30);

			$table->enum('profile_visibility', 'public', 'connections', 'private')->default("'public'");
			$table->enum('garage_visibility', 'public', 'connections', 'private')->default("'public'");
			$table->enum('post_visibility', 'public', 'connections', 'private')->default("'public'");
			$table->enum('name_display', 'full', 'first', 'anonymous')->default("'full'");

			$table->tinyInteger('contact_sync')->default(1);
			$table->tinyInteger('show_online_status')->default(1);

			$table->createdAt();
			$table->updatedAt();

			$table->index('ups_user_idx')->fields('user_id');

			$table->foreign('user_id')
				->references('id')
				->on('users')
				->onDelete('CASCADE');
		});
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('user_privacy_settings');
	}
}
