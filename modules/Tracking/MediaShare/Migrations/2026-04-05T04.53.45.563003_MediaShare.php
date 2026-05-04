<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * Create media_shares table
 *
 * Tracks when users share media items (vehicle photos, group media, etc.)
 */
class MediaShare extends Migration
{
	/**
	 * Run the migration
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->create('media_shares', function($table)
		{
			// Identity
			$table->id();

			// Relationships
			$table->integer('user_id', 30);
			$table->integer('media_id', 30);

			// Context - which module the media belongs to
			$table->enum('media_type', 'vehicle', 'group')->default("'vehicle'");

			// Share metadata
			$table->enum('share_type', 'external', 'copy_link')->default("'external'");

			// Audit
			$table->datetime('created_at')->currentTimestamp();

			// Indexes
			$table->index('user_idx')->fields('user_id', 'created_at');
			$table->index('media_idx')->fields('media_id', 'media_type');
			$table->unique('unq_user_media')->fields('user_id', 'media_id', 'media_type');

			// Foreign keys
			$table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
		});
	}

	/**
	 * Reverse the migration
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('media_shares');
	}
}
