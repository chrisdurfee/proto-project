<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * CronTracking
 *
 * Creates cron_jobs and cron_runs tables for operational cron telemetry.
 */
class CronTracking extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$this->create('cron_jobs', function($table)
		{
			$table->id();
			$table->varchar('job_key', 80);
			$table->varchar('name', 120);
			$table->varchar('routine_class', 255);
			$table->varchar('schedule', 120);
			$table->enum('log_mode', 'full', 'high_frequency')->default("'full'");
			$table->smallInteger('success_retention_days', 4)->default(90);
			$table->smallInteger('failure_retention_days', 4)->default(90);
			$table->varchar('log_file', 255)->nullable();
			$table->tinyInteger('enabled', 1)->default(1);

			$table->datetime('last_run_at')->nullable();
			$table->enum('last_status', 'success', 'failed', 'running')->nullable();
			$table->integer('last_duration_ms', 11)->nullable();
			$table->text('last_error')->nullable();
			$table->integer('consecutive_successes', 11)->default(0);
			$table->integer('total_runs', 11)->default(0);
			$table->integer('total_failures', 11)->default(0);

			$table->createdAt();
			$table->updatedAt();

			$table->unique('cj_job_key_uniq')->fields('job_key');
			$table->unique('cj_routine_class_uniq')->fields('routine_class');
			$table->index('cj_last_run_at_idx')->fields('last_run_at');
		});

		$this->create('cron_runs', function($table)
		{
			$table->id();
			$table->integer('cron_job_id', 11);
			$table->enum('status', 'running', 'success', 'failed')->default("'running'");
			$table->datetime('started_at');
			$table->datetime('finished_at')->nullable();
			$table->integer('duration_ms', 11)->nullable();
			$table->text('error_message')->nullable();

			$table->createdAt();

			$table->foreign('cron_job_id')->references('id')->on('cron_jobs');
			$table->index('cr_cron_job_created_idx')->fields('cron_job_id', 'created_at');
			$table->index('cr_status_created_idx')->fields('status', 'created_at');
		});
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('cron_runs');
		$this->drop('cron_jobs');
	}
}
