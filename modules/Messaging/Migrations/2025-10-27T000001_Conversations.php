<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * Conversations
 *
 */
class Conversations extends Migration
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
		$this->create('conversations', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->varchar('title', 255)->nullable();
			$table->text('description')->nullable();
			$table->enum('type', 'direct', 'group')->default("'direct'");
			$table->int('created_by', 30);
			$table->datetime('last_message_at')->nullable();
			$table->int('last_message_id', 30)->nullable();

			// Indexes
			$table->index('by_type')->fields('type', 'created_at');
			$table->index('creator')->fields('created_by');
			$table->index('last_message')->fields('last_message_at', 'id');

			// Foreign Keys
			$table->foreign('created_by')
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
		$this->drop('conversations');
	}
}