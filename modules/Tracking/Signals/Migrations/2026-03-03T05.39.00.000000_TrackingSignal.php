<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * TrackingSignal migration
 *
 * Creates the tracking_signals table for persisting domain event signals.
 */
class TrackingSignal extends Migration
{
	/**
	 * @return void
	 */
	public function up(): void
	{
		$this->create('tracking_signals', function($table)
		{
			$table->id();
			$table->uuid();

			$table->integer('user_id', 30)->nullable();
			$table->varchar('type', 100);
			$table->json('metadata')->nullable();
			$table->datetime('occurred_at');
			$table->createdAt();

			// Indexes
			$table->index('idx_ts_user_type')->fields('user_id', 'type');
			$table->index('idx_ts_occurred_at')->fields('occurred_at');
			$table->index('idx_ts_type')->fields('type');

			// Foreign key
			$table->foreign('user_id')
				->references('id')
				->on('users')
				->onDelete('SET NULL');
		});
	}

	/**
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('tracking_signals');
	}
}
