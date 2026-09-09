<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * SupportMessage
 *
 * Creates the support_messages table backing the Help Center forms:
 * contact requests, bug reports, and general support questions.
 *
 * The user column is nullable so a signed-out visitor can still submit
 * a contact request from the marketing site.
 */
class SupportMessage extends Migration
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
		$this->create('support_messages', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->integer('user_id', 30)->nullable();
			$table->enum('category', 'support', 'bug', 'contact')->default("'support'");
			$table->varchar('subject', 255);
			$table->text('message');
			$table->varchar('email', 255)->nullable();
			$table->enum('status', 'open', 'in_progress', 'resolved', 'closed')->default("'open'");
			$table->datetime('resolved_at')->nullable();
			$table->integer('resolved_by', 30)->nullable();

			$table->index('idx_support_user')->fields('user_id', 'created_at');
			$table->index('idx_support_status')->fields('status', 'created_at');

			$table->foreign('user_id')
				->references('id')
				->on('users')
				->onDelete('SET NULL');
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('support_messages');
	}
}
