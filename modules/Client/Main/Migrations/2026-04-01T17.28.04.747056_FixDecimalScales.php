<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * FixDecimalScales
 *
 * Proto's CreateField::decimal() previously accepted only precision (no scale),
 * causing all decimal(P,S) calls to create DECIMAL(P,0) columns. This migration
 * corrects every affected column to its intended scale.
 */
class FixDecimalScales extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		// clients
		$this->alter('clients', function ($table)
		{
			$table->alter('annual_revenue')->decimal(15, 2)->nullable();
			$table->alter('credit_limit')->decimal(15, 2)->nullable();
			$table->alter('total_revenue')->decimal(15, 2)->default(0.00);
			$table->alter('outstanding_balance')->decimal(15, 2)->default(0.00);
		});
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		// Reverting to scale 0 is not practical; this migration is a one-way fix.
	}
}
