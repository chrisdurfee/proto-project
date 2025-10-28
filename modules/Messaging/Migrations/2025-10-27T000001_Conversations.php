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
			$table->enum('type', 'direct', 'group')->default("'direct'");
			$table->text('description')->nullable();
			$table->datetime('last_message_at')->nullable();
			$table->integer('last_message_id', 30)->nullable();
			$table->integer('created_by', 30);

			// Indexes
			$table->index('created_by')->fields('created_by');
			$table->index('last_message')->fields('last_message_at', 'id');
			$table->index('type')->fields('type', 'created_at');

			// FKs
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