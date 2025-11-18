<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * AssistantConversations
 *
 */
class AssistantConversations extends Migration
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
		$this->create('assistant_conversations', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->int('user_id', 30);
			$table->varchar('title', 255)->nullable();
			$table->text('description')->nullable();
			$table->datetime('last_message_at')->nullable();
			$table->int('last_message_id', 30)->nullable();
			$table->text('last_message_content')->nullable();
			$table->deletedAt();

			// Indexes
			$table->index('user_id_idx')->fields('user_id', 'created_at');
			$table->index('last_message')->fields('last_message_at', 'id');

			// Foreign Keys
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
		$this->drop('assistant_conversations');
	}
}
