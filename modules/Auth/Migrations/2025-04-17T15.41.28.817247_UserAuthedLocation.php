<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * Migration for the user_authed_locations table.
 */
class UserAuthedLocation extends Migration
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
		$this->create('user_authed_locations', function($table)
		{
			$table->id();
			$table->timestamps();

			// GeoIP fields
			$table->varchar('ip', 45)->nullable();
			$table->varchar('network', 50)->nullable();
			$table->varchar('continent_code', 5)->nullable();
			$table->varchar('country_calling_code', 10)->nullable();

			// Location fields
			$table->varchar('city', 100)->nullable();
			$table->varchar('region', 100)->nullable();
			$table->varchar('region_code', 10)->nullable();
			$table->varchar('country', 100)->nullable();
			$table->varchar('country_code', 10)->nullable();
			$table->varchar('postal', 20)->nullable();

			// Spatial and timezone
			$table->point('position');
			$table->varchar('timezone', 50)->nullable();

			$table->deletedAt();

			// Indexes
			$table->index('ip')->fields('ip');
			$table->index('network')->fields('network');
			$table->index('city')->fields('city');
			$table->index('region')->fields('region');
			$table->index('country')->fields('country');
			$table->index('country_code')->fields('country_code');
			$table->index('postal')->fields('postal');
			$table->index('position')->fields('position')->spatial();
		});
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		$this->drop('user_authed_locations');
	}
}
