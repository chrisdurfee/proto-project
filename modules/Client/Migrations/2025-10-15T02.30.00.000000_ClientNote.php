<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * ClientNote
 *
 */
class ClientNote extends Migration
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
		$this->create('client_notes', function($table)
		{
			// Primary key
			$table->id();

			// Client relationship
			$table->integer('client_id', 30);

			// Contact relationship (optional - note can be about a specific contact)
			$table->integer('contact_id', 30)->nullable();

			// Note Information
			$table->varchar('title', 255);
			$table->text('content');
			$table->enum('note_type', 'general','meeting','call','email','task','follow_up','important','other')->default("'general'");
			$table->enum('priority', 'low','normal','high','urgent')->default("'normal'");

			// Visibility and Status
			$table->enum('visibility', 'private','team','client')->default("'team'");
			$table->enum('status', 'active','archived')->default("'active'");
			$table->tinyInteger('is_pinned')->default(0);

			// Tags
			$table->varchar('tags', 500)->nullable();

			// Related Information
			$table->integer('related_to_id', 30)->nullable();
			$table->varchar('related_to_type', 100)->nullable(); // 'call', 'meeting', 'email', etc.

			// Reminder
			$table->tinyInteger('has_reminder')->default(0);
			$table->timestamp('reminder_at')->nullable();

			// Attachments
			$table->tinyInteger('has_attachments')->default(0);
			$table->text('attachment_urls')->nullable(); // JSON array of attachment URLs

			// Follow-up
			$table->tinyInteger('requires_follow_up')->default(0);
			$table->timestamp('follow_up_at')->nullable();
			$table->text('follow_up_notes')->nullable();

			// Audit
			$table->timestamps();
			$table->integer('created_by', 30)->nullable();
			$table->integer('updated_by', 30)->nullable();
			$table->deletedAt();

			// Indexes
			$table->index('client_id')->fields('client_id', 'status');
			$table->index('contact_id')->fields('contact_id');
			$table->index('note_type')->fields('note_type');
			$table->index('priority')->fields('priority');
			$table->index('is_pinned')->fields('is_pinned');
			$table->index('created_at')->fields('created_at');
			$table->index('reminder_at')->fields('reminder_at');
			$table->index('follow_up_at')->fields('follow_up_at');

			// Foreign Keys
			$table->foreign('client_id')
					->references('id')
					->on('clients')
					->onDelete('cascade');

			$table->foreign('contact_id')
					->references('id')
					->on('client_contacts')
					->onDelete('set null');

			$table->foreign('created_by')
					->references('id')
					->on('users')
					->onDelete('set null');

			$table->foreign('updated_by')
					->references('id')
					->on('users')
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
		$this->drop('client_notes');
	}
}
