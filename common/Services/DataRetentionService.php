<?php declare(strict_types=1);

namespace Common\Services;

use Proto\Database\Database;

/**
 * DataRetentionService
 *
 * Central retention sweeper. Hard-deletes rows from append-only log
 * and analytics tables once they age past the retention window
 * defined in the data retention policy
 * (infrastructure/docs/data-retention-policy.md).
 *
 * Only leaf tables (nothing references them by foreign key) may be
 * listed here. Deletes run in batches to avoid long lock windows.
 * Invoked by DataRetentionRoutine (daily cron).
 *
 * @package Common\Services
 */
class DataRetentionService extends Service
{
	/**
	 * Rows deleted per batch.
	 */
	protected const BATCH_SIZE = 20000;

	/**
	 * Max batches per table per run (caps a single run's work).
	 */
	protected const MAX_BATCHES = 25;

	/**
	 * Retention policy: table => [timestamp column, retention days].
	 * Windows are documented and justified in
	 * infrastructure/docs/data-retention-policy.md — update both together.
	 *
	 * @var array<string, array{0: string, 1: int}>
	 */
	protected const POLICIES = [
		// Security / auth logs — long enough for investigations.
		'login_attempts' => ['created_at', 90],
		'login_log' => ['created_at', 365],
		'proto_error_log' => ['created_at', 90],

		// Analytics — aggregates are derived elsewhere; raw events age out.
		'user_activity_log' => ['created_at', 180],
	];

	/**
	 * Conditional retention: table => [timestamp column, days, AND clause].
	 *
	 * Used when a table mixes high-volume noise rows with signal rows that
	 * must be kept indefinitely (e.g. an events table where "viewed" rows
	 * age out but "created" rows feed long-lived counters). The AND clause
	 * is a static trusted fragment (never user input) appended to both the
	 * eligibility count and the batched delete.
	 *
	 * @var array<string, array{0: string, 1: int, 2: string}>
	 */
	protected const CONDITIONAL_POLICIES = [];

	/**
	 * Returns the retention policy map (table => [column, days]).
	 *
	 * @return array<string, array{0: string, 1: int}>
	 */
	public static function policies(): array
	{
		return self::POLICIES;
	}

	/**
	 * Returns conditional retention policies (table => [column, days, andSql]).
	 *
	 * @return array<string, array{0: string, 1: int, 2: string}>
	 */
	public static function conditionalPolicies(): array
	{
		return self::CONDITIONAL_POLICIES;
	}

	/**
	 * Runs the retention sweep across all policy tables.
	 *
	 * @return int Total rows deleted.
	 */
	public function sweep(): int
	{
		$db = Database::getConnection('default');
		if ($db === null)
		{
			error_log('DataRetentionService: no database connection.');
			return 0;
		}

		$total = 0;
		foreach (self::POLICIES as $table => [$column, $days])
		{
			$total += $this->sweepTable($db, $table, $column, $days);
		}

		foreach (self::CONDITIONAL_POLICIES as $table => [$column, $days, $andSql])
		{
			$total += $this->sweepTable($db, $table, $column, $days, $andSql);
		}

		return $total;
	}

	/**
	 * Deletes expired rows from a single table in batches.
	 *
	 * @param object $db
	 * @param string $table
	 * @param string $column
	 * @param int $days
	 * @param string|null $andSql Optional trusted AND clause (no bindings).
	 * @return int
	 */
	protected function sweepTable(
		object $db,
		string $table,
		string $column,
		int $days,
		?string $andSql = null
	): int
	{
		$cutoff = date('Y-m-d H:i:s', time() - ($days * 86400));
		$extra = ($andSql !== null && $andSql !== '') ? ' AND ' . $andSql : '';

		try
		{
			$row = $db->first(
				"SELECT COUNT(*) AS n FROM {$table} WHERE {$column} < ?{$extra}",
				[$cutoff]
			);
			$eligible = (int)($row->n ?? 0);
			if ($eligible <= 0)
			{
				return 0;
			}

			$batches = min(self::MAX_BATCHES, (int)ceil($eligible / self::BATCH_SIZE));
			for ($batch = 0; $batch < $batches; $batch++)
			{
				$ok = $db->execute(
					"DELETE FROM {$table} WHERE {$column} < ?{$extra} LIMIT " . self::BATCH_SIZE,
					[$cutoff]
				);
				if (!$ok)
				{
					break;
				}
			}

			return min($batches * self::BATCH_SIZE, $eligible);
		}
		catch (\Throwable $e)
		{
			error_log('DataRetentionService: sweep of ' . $table . ' failed: ' . $e->getMessage());
			return 0;
		}
	}
}
