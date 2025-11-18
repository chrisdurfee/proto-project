<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * AssistantMessages
 *
 */
class AssistantMessages extends Migration
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
		$this->create('assistant_messages', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->int('conversation_id', 30);
			$table->int('user_id', 30);
			$table->enum('role', 'user', 'assistant')->default("'user'");
			$table->text('content');
			$table->enum('type', 'text', 'code', 'system')->default("'text'");
			$table->boolean('is_streaming')->default(0);
			$table->boolean('is_complete')->default(1);
			$table->deletedAt();

			// Indexes
			$table->index('conversation')->fields('conversation_id', 'created_at');
			$table->index('user')->fields('user_id', 'created_at');
			$table->index('deleted_at_idx')->fields('deleted_at', 'conversation_id');

			// Foreign Keys
			$table->foreign('conversation_id')
				->references('id')
				->on('assistant_conversations')
				->onDelete('cascade');

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
		$this->drop('assistant_messages');
	}
}
