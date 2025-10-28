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
			$table->integer('conversation_id', 30);
			$table->integer('sender_id', 30);
			$table->text('content');
			$table->enum('message_type', 'text', 'audio', 'image', 'file')->default("'text'");
			$table->varchar('file_url', 500)->nullable();
			$table->varchar('file_name', 255)->nullable();
			$table->integer('file_size', 20)->nullable();
			$table->varchar('audio_duration', 10)->nullable();
			$table->boolean('is_edited')->default(0);
			$table->datetime('edited_at')->nullable();
			$table->datetime('read_at')->nullable();

			// Indexes
			$table->index('conversation')->fields('conversation_id', 'created_at');
			$table->index('sender')->fields('sender_id', 'created_at');
			$table->index('read_status')->fields('conversation_id', 'read_at');

			// FKs
			$table->foreign('conversation_id')
				->references('id')
				->on('conversations')
				->onDelete('cascade');

			$table->foreign('sender_id')
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
		$this->drop('messages');
	}
}