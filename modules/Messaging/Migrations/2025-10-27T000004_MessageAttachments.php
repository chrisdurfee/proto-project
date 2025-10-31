<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * MessageAttachments
 *
 */
class MessageAttachments  extends Migration
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
		$this->create('message_attachments', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->int('message_id', 30);
			$table->varchar('file_url', 500);
			$table->varchar('file_type', 100)->nullable();
			$table->varchar('file_name', 255)->nullable();
			$table->int('file_size', 30)->nullable();

			$table->index('message_file')->fields('message_id', 'file_type');

			$table->foreign('message_id')
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
		$this->drop('message_attachments');
	}
}