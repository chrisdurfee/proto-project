<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;
use Proto\Database\QueryBuilder\Create;

/**
 * Client
 *
 */
class Client extends Migration
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
		$this->create('clients', function($table)
		{
			// Primary key
			$table->id();

			// Identity
			$table->uuid();
			$table->varchar('company_name', 255)->nullable();
			$table->enum('client_type', 'individual','business','enterprise')->default("'individual'");
			$table->varchar('client_number', 50)->nullable(); // unique client reference
			$table->varchar('website', 255)->nullable();

			// Business Details
			$table->varchar('industry', 100)->nullable();
			$table->varchar('tax_id', 50)->nullable();
			$table->integer('employee_count', 10)->nullable();
			$table->decimal('annual_revenue', 15, 2)->nullable();

			// Address
			$table->varchar('street_1', 255)->nullable();
			$table->varchar('street_2', 255)->nullable();
			$table->varchar('city', 100)->nullable();
			$table->varchar('state', 100)->nullable();
			$table->varchar('postal_code', 20)->nullable();
			$table->varchar('country', 100)->nullable();

			// Billing Address (if different)
			$table->varchar('billing_street_1', 255)->nullable();
			$table->varchar('billing_street_2', 255)->nullable();
			$table->varchar('billing_city', 100)->nullable();
			$table->varchar('billing_state', 100)->nullable();
			$table->varchar('billing_postal_code', 20)->nullable();
			$table->varchar('billing_country', 100)->nullable();

			// CRM Status & Classification
			$table->enum('status', 'active','inactive','prospect','lead','customer','former')->default("'prospect'");
			$table->enum('priority', 'low','medium','high','critical')->default("'medium'");
			$table->varchar('lead_source', 100)->nullable(); // website, referral, cold_call, etc.
			$table->varchar('rating', 50)->nullable(); // hot, warm, cold
			$table->text('tags')->nullable(); // JSON array of tags

			// Financial
			$table->varchar('currency', 3)->default("'USD'");
			$table->varchar('payment_terms', 50)->nullable(); // net30, net60, etc.
			$table->decimal('credit_limit', 15, 2)->nullable();
			$table->decimal('total_revenue', 15, 2)->default(0.00);
			$table->decimal('outstanding_balance', 15, 2)->default(0.00);

			// Relationship Management
			$table->integer('assigned_to', 30)->nullable(); // user_id of account manager
			$table->integer('created_by_user_id', 30)->nullable();
			$table->date('first_contact_date')->nullable();
			$table->date('last_contact_date')->nullable();
			$table->timestamp('last_activity_at')->nullable();
			$table->date('next_follow_up_date')->nullable();

			// Social Media
			$table->varchar('linkedin_url', 255)->nullable();
			$table->varchar('twitter_handle', 100)->nullable();
			$table->varchar('facebook_url', 255)->nullable();

			// Preferences
			$table->enum('preferred_contact_method', 'email','phone','sms','fax','mail')->nullable();
			$table->varchar('language', 10)->default("'en'");
			$table->varchar('timezone', 50)->nullable();
			$table->tinyInteger('marketing_opt_in')->default(0);
			$table->tinyInteger('newsletter_subscribed')->default(0);

			// Notes & Custom
			$table->text('notes')->nullable();
			$table->text('internal_notes')->nullable(); // private notes not visible to client
			$table->text('custom_fields')->nullable(); // JSON for extensibility

			// Flags
			$table->tinyInteger('is_vip')->default(0);
			$table->tinyInteger('do_not_contact')->default(0);
			$table->tinyInteger('email_bounced')->default(0);
			$table->tinyInteger('verified')->default(0);

			// Audit & Soft Delete
			$table->timestamps();
			$table->integer('updated_by', 30)->nullable();
			$table->deletedAt();

			// Indexes for performance
			$table->index('email')->fields('email');
			$table->index('company_name')->fields('company_name');
			$table->index('client_number')->fields('client_number');
			$table->index('first_name')->fields('first_name', 'last_name');
			$table->index('last_name')->fields('last_name', 'first_name');
			$table->index('status')->fields('status', 'priority');
			$table->index('assigned_to')->fields('assigned_to', 'status');
			$table->index('created_at')->fields('created_at');
			$table->index('last_activity_at')->fields('last_activity_at');
			$table->index('next_follow_up_date')->fields('next_follow_up_date');

			// Foreign Keys
			$table->foreign('assigned_to')
					->references('id')
					->on('users')
					->onDelete('set null');

			$table->foreign('created_by_user_id')
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
		$this->drop('clients');
	}
}