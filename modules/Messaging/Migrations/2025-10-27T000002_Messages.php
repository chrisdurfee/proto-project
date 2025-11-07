<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * Messages
 *
 */
class Messages extends Migration
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
		$this->create('messages', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->int('conversation_id', 30);
			$table->int('sender_id', 30);
			$table->int('parent_id', 30)->nullable(); // for threads/replies
			$table->enum('type', 'text', 'image', 'file', 'system')->default("'text'");
			$table->text('content')->nullable();
			$table->boolean('is_edited')->default(0);
			$table->datetime('edited_at')->nullable();
			$table->deletedAt();

			// Indexes
			$table->index('conversation')->fields('conversation_id', 'created_at');
			$table->index('sender')->fields('sender_id', 'created_at');
			$table->index('thread_parent')->fields('parent_id');
			$table->index('deleted_at_idx')->fields('deleted_at', 'conversation_id');
			$table->index('conversation_id')->fields('conversation_id', 'created_at', 'updated_at', 'deleted_at');

			// Foreign Keys
			$table->foreign('conversation_id')
				->references('id')
				->on('conversations')
				->onDelete('cascade');

			$table->foreign('sender_id')
				->references('id')
				->on('users')
				->onDelete('cascade');

			$table->foreign('parent_id')
				->references('id')
				->on('messages')
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
		$this->drop('messages');
	}
}