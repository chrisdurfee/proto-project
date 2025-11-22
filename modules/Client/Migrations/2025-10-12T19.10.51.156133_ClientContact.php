<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * ClientContact
 *
 */
class ClientContact extends Migration
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
		$this->create('client_contacts', function($table)
		{
			// Primary key
			$table->id();

			// Client relationship
			$table->integer('client_id', 30);

			// User account relationship (optional)
			$table->integer('user_id', 30)->nullable();

			// Contact type and priority
			$table->enum('contact_type', 'primary','billing','technical','decision_maker','influencer','other')->default("'other'");
			$table->tinyInteger('is_primary')->default(0);

			// Contact Information
			$table->varchar('job_title', 150)->nullable();
			$table->varchar('department', 100)->nullable();
			$table->varchar('email', 255);
			$table->varchar('phone', 20)->nullable();
			$table->varchar('fax', 20)->nullable();

			// Preferences
			$table->enum('preferred_contact_method', 'email','phone','sms','fax','mail')->nullable();
			$table->varchar('language', 10)->default("'en'");
			$table->varchar('timezone', 50)->nullable();

			// Social Media
			$table->varchar('linkedin_url', 255)->nullable();
			$table->varchar('twitter_handle', 100)->nullable();

			// Communication preferences
			$table->tinyInteger('newsletter_subscribed')->default(0);

			// Status
			$table->enum('contact_status', 'active','inactive','bounced')->default("'active'");
			$table->tinyInteger('do_not_contact')->default(0);
			$table->tinyInteger('email_bounced')->default(0);

			// Notes
			$table->text('notes')->nullable();

			// Personal
			$table->varchar('assistant_name', 100)->nullable();
			$table->varchar('assistant_phone', 20)->nullable();

			// Audit
			$table->timestamps();
			$table->integer('created_by', 30)->nullable();
			$table->integer('updated_by', 30)->nullable();
			$table->deletedAt();

			// Indexes
			$table->index('client_id')->fields('client_id', 'is_primary');
			$table->index('email')->fields('email');
			$table->index('user_id')->fields('user_id');
			$table->index('contact_type')->fields('contact_type');
			$table->index('contact_status')->fields('contact_status');

			// Foreign Keys
			$table->foreign('client_id')
					->references('id')
					->on('clients')
					->onDelete('cascade');

			$table->foreign('user_id')
					->references('id')
					->on('users')
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
		$this->drop('client_contacts');
	}
}