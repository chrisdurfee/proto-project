<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * ClientCall
 *
 */
class ClientCall extends Migration
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
		$this->create('client_calls', function($table)
		{
			// Primary key
			$table->id();

			// Client relationship
			$table->integer('client_id', 30);

			// Contact relationship (optional - if call is linked to a specific contact)
			$table->integer('contact_id', 30)->nullable();

			// Call details
			$table->enum('call_type', 'inbound','outbound','missed','voicemail')->default("'outbound'");
			$table->enum('call_status', 'scheduled','in_progress','completed','missed','cancelled','no_answer')->default("'completed'");
			$table->varchar('subject', 255)->nullable();
			$table->text('notes')->nullable();

			// Participants
			$table->varchar('caller_name', 100)->nullable();
			$table->varchar('caller_phone', 20)->nullable();
			$table->varchar('recipient_name', 100)->nullable();
			$table->varchar('recipient_phone', 20)->nullable();

			// Call timing
			$table->timestamp('scheduled_at')->nullable();
			$table->timestamp('started_at')->nullable();
			$table->timestamp('ended_at')->nullable();
			$table->integer('duration', 10)->default(0)->comment('Duration in seconds');

			// Call outcome
			$table->enum('outcome', 'successful','busy','no_answer','voicemail','disconnected','other')->nullable();
			$table->text('outcome_notes')->nullable();

			// Recording & Attachments
			$table->varchar('recording_url', 500)->nullable();
			$table->tinyInteger('has_recording')->default(0);

			// Follow-up
			$table->tinyInteger('requires_follow_up')->default(0);
			$table->timestamp('follow_up_at')->nullable();
			$table->text('follow_up_notes')->nullable();

			// Priority & Tags
			$table->enum('priority', 'low','normal','high','urgent')->default("'normal'");
			$table->varchar('tags', 500)->nullable()->comment('Comma-separated tags');

			// Audit
			$table->timestamps();
			$table->integer('created_by', 30)->nullable();
			$table->integer('updated_by', 30)->nullable();
			$table->deletedAt();

			// Indexes
			$table->index('client_id')->fields('client_id', 'call_type');
			$table->index('contact_id')->fields('contact_id');
			$table->index('call_status')->fields('call_status');
			$table->index('scheduled_at')->fields('scheduled_at');
			$table->index('started_at')->fields('started_at');
			$table->index('call_type')->fields('call_type');
			$table->index('outcome')->fields('outcome');
			$table->index('priority')->fields('priority');

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
		$this->drop('client_calls');
	}
}