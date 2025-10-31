<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * MessageReactions
 *
 */
class MessageReactions  extends Migration
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
		$this->create('message_reactions', function($table)
		{
			$table->id();
			$table->timestamps();

			$table->int('message_id', 30);
			$table->int('user_id', 30);
			$table->varchar('emoji', 50);

			// Indexes
			$table->unique('reaction_unique')->fields('message_id', 'user_id', 'emoji');
			$table->index('user_reactions')->fields('user_id');

			// Foreign Keys
			$table->foreign('message_id')
				->references('id')
				->on('messages')
				->onDelete('cascade');

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
		$this->drop('message_reactions');
	}
}