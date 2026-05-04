<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * UserNotification Migration
 *
 * Creates the user_notifications table for the notification inbox.
 */
class UserNotification extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->create('user_notifications', function($table)
		{
			$table->id();
			$table->uuid();

			// owner
			$table->integer('user_id', 30);

			// classification
			$table->enum('type', 'garage', 'offers_users', 'offers_partners', 'market', 'upcoming', 'social', 'updates', 'achievement');
			$table->enum('category', 'maintenance', 'offers', 'social', 'market', 'events', 'updates', 'partners', 'achievement');
			$table->enum('priority', 'high', 'medium', 'low')->default("'medium'");

			// content
			$table->varchar('title', 255);
			$table->text('description');
			$table->varchar('icon_name', 50);

			// optional action labels (frontend routes via type + ref_id)
			$table->varchar('primary_action', 100)->nullable();
			$table->varchar('secondary_action', 100)->nullable();

			// optional badge overlay e.g. {"icon":"bookmark","label":"Saved"}
			$table->json('status_badge')->nullable();

			// arbitrary context data from the calling module
			$table->json('metadata')->nullable();

			// reference to the source object (post, offer, event, etc.)
			$table->integer('ref_id', 30)->nullable();
			$table->varchar('ref_type', 50)->nullable();

			// read state
			$table->boolean('is_read')->default(0);
			$table->datetime('read_at')->nullable();

			// audit
			$table->timestamps();
			$table->deletedAt();

			// indexes
			$table->index('un_user_read_idx')->fields('user_id', 'is_read');
			$table->index('un_user_type_idx')->fields('user_id', 'type');
			$table->index('un_user_created_idx')->fields('user_id', 'created_at');

			// foreign key
			$table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
		});
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('user_notifications');
	}
}
