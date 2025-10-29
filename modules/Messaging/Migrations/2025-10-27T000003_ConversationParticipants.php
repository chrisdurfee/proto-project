<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * ConversationParticipants
 *
 */
class ConversationParticipants extends Migration
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
		$this->create('conversation_participants', function($table)
		{
			$table->id();
			$table->timestamps();
            $table->deletedAt();
			$table->integer('conversation_id', 30);
			$table->integer('user_id', 30);
			$table->enum('role', 'member', 'admin')->default("'member'");
			$table->timestamp('joined_at')->default("CURRENT_TIMESTAMP");
			$table->datetime('last_read_at')->nullable();
			$table->integer('last_read_message_id', 30)->nullable();

			// Indexes
			$table->index('conversation_user')->fields('conversation_id', 'user_id');
			$table->index('user_conversations')->fields('user_id', 'deleted_at');
			$table->index('last_read')->fields('conversation_id', 'last_read_at');

			// Unique constraint
			$table->unique('conv_user')->fields('conversation_id', 'user_id');

			// FKs
			$table->foreign('conversation_id')
				->references('id')
				->on('conversations')
				->onDelete('cascade');

			$table->foreign('user_id')
				->references('id')
				->on('users')
				->onDelete('cascade');

			$table->foreign('last_read_message_id')
				->references('id')
				->on('messages')
				->onDelete('set null');
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('conversation_participants');
	}
}