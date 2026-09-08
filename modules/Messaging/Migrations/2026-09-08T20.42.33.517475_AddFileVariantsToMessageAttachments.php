<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * AddFileVariantsToMessageAttachments
 *
 * Adds a JSON column on `message_attachments` to store optimized image
 * variant filenames (thumb / card / large) so the message thread can
 * render resized previews instead of the full-size original.
 */
class AddFileVariantsToMessageAttachments extends Migration
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
		$this->alter('message_attachments', function($table)
		{
			$table->json('file_variants')->nullable()->after('file_size');
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->alter('message_attachments', function($table)
		{
			$table->dropColumn('file_variants');
		});
	}
}
