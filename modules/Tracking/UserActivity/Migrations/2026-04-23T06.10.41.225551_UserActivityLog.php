<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * UserActivityLog
 *
 * Creates the user_activity_log table for tracking recent user actions
 * displayed on the profile page.
 */
class UserActivityLog extends Migration
{
	/**
	 * Runs the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->create('user_activity_log', function($table)
		{
			$table->id();
			$table->integer('user_id', 30);
			$table->varchar('action', 50);
			$table->varchar('title', 255);
			$table->varchar('description', 500)->nullable();
			$table->integer('ref_id', 30)->nullable();
			$table->varchar('ref_type', 50)->nullable();
			$table->createdAt();

			// Indexes
			$table->index('idx_ual_user_created')->fields('user_id', 'created_at');
			$table->index('idx_ual_action')->fields('action', 'user_id');

			// Foreign keys
			$table->foreign('user_id')
				->references('id')
				->on('users')
				->onDelete('cascade');
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('user_activity_log');
	}
}
