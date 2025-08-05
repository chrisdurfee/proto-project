<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * PasswordRequest
 */
class PasswordRequest extends Migration
{
	/**
	 * @var string $connection
	 */
	protected string $connection = 'default';

	/**
	 * Runs the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->create('password_requests', function($table)
		{
			$table->id();
			$table->timestamps();
			$table->int('user_id', 30);
			$table->varchar('request_id', 256);
			$table->enum('status', 'pending', 'complete', 'expired', 'cancelled')->default('"pending"');

			// Indexes
			$table->index('user_id')->fields('user_id', 'status');
			$table->index('request_id')->fields('request_id', 'user_id', 'created_at', 'status');
			$table->index('created_at')->fields('created_at');

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
		$this->drop('password_requests');
	}
}