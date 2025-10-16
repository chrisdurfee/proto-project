<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * ClientConversation
 *
 * Migration for client conversation messages/threads.
 * This table stores all conversation entries between team members about a client.
 */
class ClientConversation extends Migration
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
		$this->create('client_conversations', function($table)
		{
			// Primary key
			$table->id();

			// Foreign keys
			$table->int('client_id', 30);
			$table->int('user_id', 30); // team member who posted
			$table->int('parent_id', 30)->nullable(); // for threaded replies

			// Message content
			$table->text('message');
			$table->tinyInteger('is_internal')->default('1'); // internal team note vs client-visible
			$table->tinyInteger('is_pinned')->default('0');
			$table->tinyInteger('is_edited')->default('0');

			// Metadata
			$table->varchar('message_type', 50)->default("'text'"); // text, system, file_upload, etc.
			$table->integer('attachment_count', 10)->default('0');

			// Timestamps
			$table->timestamp('edited_at')->nullable();
			$table->timestamps();
			$table->deletedAt();

			// Indexes
			$table->index('client_id')->fields('client_id');
			$table->index('user_id')->fields('user_id');
			$table->index('parent_id')->fields('parent_id');
			$table->index('created_at')->fields('created_at');
			$table->index('client_id_created')->fields('client_id', 'created_at');
			// Foreign key constraints
			$table->foreign('client_id')->references('id')->on('clients')->onDelete('CASCADE');
			$table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
			$table->foreign('parent_id')->references('id')->on('client_conversations')->onDelete('CASCADE');
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('client_conversations');
	}
}
