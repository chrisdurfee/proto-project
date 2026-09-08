<?php declare(strict_types=1);

namespace Common\Services;

use Common\Email\Alerts\SlowQueryAlertEmail;
use Common\Services\Traits\OpsAlertEmailTrait;
use Proto\Database\Database;
use Proto\Dispatch\Dispatcher;

/**
 * SlowQueryAlertService
 *
 * Watches MariaDB's slow query log for a spike in queries that genuinely
 * exceed `long_query_time` (see performance.cnf) within a trailing window,
 * and emails an ops alert when the count crosses the threshold.
 *
 * This intentionally counts rows in `mysql.slow_log` filtered on the real
 * `query_time` column, rather than diffing `SHOW GLOBAL STATUS LIKE
 * 'Slow_queries'` (the original implementation). That counter looked like
 * the obvious choice, but `performance.cnf` also sets
 * `log_queries_not_using_indexes=1`, which writes every query that skips
 * an index to the slow log *regardless of how fast it ran* — and, in
 * practice on this MariaDB version, every such write also bumps
 * `Slow_queries`, even for sub-millisecond queries. On a server with even
 * one or two frequently-hit unindexed lookups, that alone can add up to
 * hundreds of "slow queries" every 15 minutes with zero real performance
 * impact, permanently drowning out genuine signal. Filtering
 * `mysql.slow_log` on `query_time >= long_query_time` restores the
 * original intent while leaving `log_queries_not_using_indexes` free to
 * keep doing its own, separate, valuable job of flagging missing-index
 * queries in `slow.log` for manual review.
 *
 * Dump-tool noise (`SQL_NO_CACHE` from mariadb-dump / mysqldump) and the
 * MariaDB `SET timestamp=...` prefixes are also excluded so nightly
 * backups cannot trip the spike alert.
 *
 * Requires `log_output` to include `TABLE` (see performance.cnf) so slow
 * queries also land in `mysql.slow_log` — the flat file remains the
 * source of truth for manual `slow.log` review; the table only exists so
 * this check can filter structurally instead of parsing text. The runtime
 * DB user has a narrow, read-only grant on that one system table (see
 * `infrastructure/scripts/create-app-db-user.sql`).
 *
 * Since the query counts a fixed trailing window on every run instead of
 * diffing a cumulative counter, no baseline needs to persist between runs
 * (unlike the original implementation, this check no longer depends on
 * Redis at all).
 *
 * Sending is opt-in via email.alertsEnabled — leave that false for
 * local/dev and personal SMTP inboxes.
 *
 * @package Common\Services
 */
class SlowQueryAlertService extends Service
{
	use OpsAlertEmailTrait;

	/**
	 * Genuinely slow queries (query_time >= long_query_time) within the
	 * window that trigger an alert.
	 */
	protected const THRESHOLD = 50;

	/**
	 * Trailing window checked on every run, in minutes. Should match
	 * (or be slightly wider than) the cron interval.
	 */
	protected const WINDOW_MINUTES = 15;

	/**
	 * Checks mysql.slow_log for a spike in genuinely slow queries and
	 * emails an alert if found.
	 *
	 * @return bool True if an alert was sent.
	 */
	public function checkAndAlert(): bool
	{
		if (!$this->alertsEnabled())
		{
			return false;
		}

		$db = Database::getConnection('default');
		if ($db === null)
		{
			error_log('SlowQueryAlertService: no database connection.');
			return false;
		}

		try
		{
			$longQueryTime = $this->getLongQueryTime($db);
			$count = $this->countSlowQueries($db, $longQueryTime);
		}
		catch (\Throwable $e)
		{
			error_log('SlowQueryAlertService: slow log check failed: ' . $e->getMessage());
			return false;
		}

		if ($count < self::THRESHOLD)
		{
			return false;
		}

		$sample = $this->getWorstOffender($db, $longQueryTime);

		// The spike itself is what matters; a failed notification
		// should never make the check look like it found nothing.
		try
		{
			$this->sendAlert($count, $sample);
		}
		catch (\Throwable $e)
		{
			error_log('SlowQueryAlertService: alert dispatch failed: ' . $e->getMessage());
		}

		return true;
	}

	/**
	 * Reads the server's current long_query_time threshold, in seconds.
	 *
	 * @param object $db
	 * @return float
	 */
	protected function getLongQueryTime(object $db): float
	{
		$row = $db->first('SELECT @@long_query_time AS value');
		return (float)($row->value ?? 1.0);
	}

	/**
	 * Counts queries in the trailing window whose actual execution time
	 * met or exceeded long_query_time — excludes rows only present in
	 * the slow log because of log_queries_not_using_indexes.
	 *
	 * @param object $db
	 * @param float $longQueryTime
	 * @return int
	 */
	protected function countSlowQueries(object $db, float $longQueryTime): int
	{
		$row = $db->first(
			"SELECT COUNT(*) AS total
			FROM mysql.slow_log
			WHERE start_time >= (NOW() - INTERVAL ? MINUTE)
			AND query_time >= SEC_TO_TIME(?)
			AND sql_text NOT LIKE 'SET timestamp=%'
			AND sql_text NOT LIKE '%SQL_NO_CACHE%'",
			[self::WINDOW_MINUTES, $longQueryTime]
		);

		return (int)($row->total ?? 0);
	}

	/**
	 * Finds the single longest-running genuinely slow query in the
	 * window, for context in the alert email.
	 *
	 * @param object $db
	 * @param float $longQueryTime
	 * @return object|null {sqlText: string, queryTime: float, db: string}
	 */
	protected function getWorstOffender(object $db, float $longQueryTime): ?object
	{
		try
		{
			return $db->first(
				"SELECT sql_text AS sqlText, TIME_TO_SEC(query_time) AS queryTime, db AS dbName
				FROM mysql.slow_log
				WHERE start_time >= (NOW() - INTERVAL ? MINUTE)
				AND query_time >= SEC_TO_TIME(?)
				AND sql_text NOT LIKE 'SET timestamp=%'
				AND sql_text NOT LIKE '%SQL_NO_CACHE%'
				ORDER BY query_time DESC
				LIMIT 1",
				[self::WINDOW_MINUTES, $longQueryTime]
			);
		}
		catch (\Throwable)
		{
			return null;
		}
	}

	/**
	 * Emails the ops alert address configured for security alerts,
	 * falling back to the general notice address.
	 *
	 * @param int $count
	 * @param object|null $sample
	 * @return void
	 */
	protected function sendAlert(int $count, ?object $sample): void
	{
		$to = $this->getAlertRecipient();
		if (!$to)
		{
			error_log('SlowQueryAlertService: no alert recipient configured (email.securityAlerts / email.default), or alertsEnabled is false.');
			return;
		}

		$settings = (object)[
			'to' => $to,
			'subject' => "Slow query spike: {$count} slow queries in " . self::WINDOW_MINUTES . ' minutes',
			'template' => SlowQueryAlertEmail::class
		];

		Dispatcher::email($settings, (object)[
			'count' => $count,
			'elapsedMinutes' => self::WINDOW_MINUTES,
			'sampleSql' => $sample->sqlText ?? '',
			'sampleTime' => (float)($sample->queryTime ?? 0),
			'sampleDb' => $sample->dbName ?? ''
		]);
	}
}
