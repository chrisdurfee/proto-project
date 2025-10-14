<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * ClientConversationAttachment
 *
 * Migration for client conversation attachments.
 * This table stores files/images attached to conversation messages.
 */
class ClientConversationAttachment extends Migration
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
		$this->create('client_conversation_attachments', function($table)
		{
			// Primary key
			$table->id();

			// Foreign keys
			$table->int('conversation_id', 30);
			$table->int('uploaded_by', 30); // user who uploaded

			// File information
			$table->varchar('file_name', 255);
			$table->varchar('file_path', 500);
			$table->varchar('file_type', 100); // MIME type
			$table->varchar('file_extension', 10);
			$table->integer('file_size', 10)->default(0); // size in bytes

			// Optional metadata
			$table->varchar('display_name', 255)->nullable(); // custom display name
			$table->text('description')->nullable();
			$table->integer('download_count', 10)->default(0);

			// Image-specific (if applicable)
			$table->integer('width', 10)->nullable();
			$table->integer('height', 10)->nullable();
			$table->varchar('thumbnail_path', 500)->nullable();

			// Timestamps
			$table->timestamps();
			$table->deletedAt();

			// Indexes
			$table->index('conversation_id');
			$table->index('uploaded_by');
			$table->index('file_type');
			$table->index('created_at');

			// Foreign key constraints
			$table->foreignKey('conversation_id')
				->references('id')
				->on('client_conversations')
				->onDelete('CASCADE');
			$table->foreignKey('uploaded_by')
				->references('id')
				->on('users')
				->onDelete('CASCADE');
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('client_conversation_attachments');
	}
}
