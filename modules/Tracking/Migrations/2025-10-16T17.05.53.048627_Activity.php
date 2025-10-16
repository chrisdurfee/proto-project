<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * Activity
 *
 */
class Activity extends Migration
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
		$this->create('activity', function($table)
		{
			$table->id();
			$table->timestamps();
			$table->enum('type', 'client', 'ticket', 'message');
			$table->integer('user_id', 30);
			$table->integer('ref_id', 30);

			// Indexes
			$table->index('user_id')->fields('type', 'user_id', 'ref_id', 'created_at');
			$table->index('type')->fields('type', 'ref_id');
			$table->index('created_at')->fields('created_at', 'type');

			// FKs
			$table->foreign('user_id')
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
		$this->drop('activity');
	}
}