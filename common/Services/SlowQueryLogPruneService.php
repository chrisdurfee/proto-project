<?php declare(strict_types=1);

namespace Common\Services;

use Proto\Database\Database;

/**
 * SlowQueryLogPruneService
 *
 * Prunes old rows from `mysql.slow_log` (see performance.cnf's
 * `log_output=FILE,TABLE`, and SlowQueryAlertService which reads this
 * table). Unlike DataRetentionService's leaf tables, `mysql.slow_log`
 * uses the CSV storage engine and is treated by the server as a "log
 * table" — MariaDB flatly rejects direct DML against it:
 *
 *   DELETE FROM mysql.slow_log WHERE start_time < ...
 *   -- ERROR 1556 (HY000): You can't use locks with log tables
 *
 * This isn't a permissions problem — even the root user gets that
 * error. INSERT/UPDATE/DELETE against a table currently bound as a log
 * output target are only permitted internally, by the server itself
 * (see MariaDB's "Writing Logs Into Tables" docs). The only thing a
 * plain filtered DELETE could ever do here is fail.
 *
 * Two documented workarounds exist:
 *   1. Disable logging (`SET GLOBAL slow_query_log = 'OFF'` /
 *      `log_output`), operate on the now-unbound table, then
 *      re-enable. This is what MariaDB's own docs show for converting
 *      the table's storage engine. It works, but `SET GLOBAL` on these
 *      variables requires the `SUPER` privilege in MariaDB (they are
 *      not bound to any of the narrower 10.5+ admin privileges), which
 *      is a much bigger grant than this one nightly job should need.
 *   2. Atomically RENAME the log table away and a fresh one into its
 *      place. MariaDB keeps writing to whatever table is currently
 *      *named* `slow_log` — a two-pair `RENAME TABLE a TO b, c TO d`
 *      swap is uninterrupted (no dropped writes, no SUPER) because the
 *      server never stops running between the two renames in the same
 *      statement.
 *
 * This service uses option 2. On each run it:
 *   1. Builds a fresh replacement table (`slow_log_next`) with the
 *      live table's exact schema.
 *   2. Converts it to `ENGINE=MyISAM` and adds indexes on `start_time`
 *      and `query_time` — MariaDB's log-table docs list MyISAM (besides
 *      CSV) as a supported engine for `general_log`/`slow_log`, so this
 *      is fully within normal server support, not a hack. The default
 *      CSV engine supports zero indexes at all, so every read against
 *      it — including SlowQueryController's dashboard list and this
 *      service's own `countEligible()`/`countAll()` — is a full table
 *      scan; that got measurably slow once the table crossed ~30k rows
 *      (a 598ms dashboard query examining 28k+ rows was the report that
 *      prompted this). Once the live table is MyISAM, every future
 *      `LIKE`-copy here naturally preserves the engine and both indexes
 *      with no extra step — the explicit ALTERs below only matter for
 *      the very first run after this change ships, or if the table is
 *      ever rebuilt from scratch (e.g. disaster recovery) without them.
 *   3. Copies every row worth *keeping* (start_time >= cutoff) from the
 *      live table into it — an ordinary INSERT...SELECT, since neither
 *      side is currently the log table.
 *   4. Atomically swaps `slow_log_next` into the `slow_log` name while
 *      renaming the old `slow_log` to `slow_log_prev`. The swap is a
 *      single statement, so MariaDB never has a moment without a table
 *      bound to `slow_log` — logging is never interrupted.
 *   5. Drops `slow_log_prev` (which now holds the expired rows, plus
 *      whatever few rows landed in the sliver of time between the
 *      step-3 snapshot and the step-4 rename).
 *
 * Trade-off: rows logged in that sliver (typically single-digit
 * milliseconds — steps 2 and 3 run back to back with no other work
 * between them, and this job runs off-peak) are not carried over to
 * the new table and are lost a few milliseconds early. This is a
 * deliberate, documented trade-off in exchange for never requiring
 * `SUPER` and never pausing slow-query logging — acceptable for a
 * diagnostics-only table that SlowQueryAlertService already consumes
 * on a 15-minute trailing window, not a real-time or audit source.
 *
 * Privileges: this needs SELECT/INSERT/CREATE/ALTER/DROP on a handful
 * of specific table names under `mysql.*` — well beyond the general
 * runtime user's read-only grant on `mysql.slow_log` (see
 * SlowQueryAlertService and create-app-db-user.sql), and deliberately
 * not folded into it. Runs under the dedicated `connections.slowLogMaintenance`
 * credential instead (see common/Config/.env and create-app-db-user.sql
 * for the exact grant). Invoked by SlowQueryLogPruneRoutine (daily cron).
 *
 * @package Common\Services
 */
class SlowQueryLogPruneService extends Service
{
	/**
	 * Retention window, in days. `mysql.slow_log` mirrors the same
	 * writes as slow.log (see performance.cnf), including every query
	 * that skips an index (`log_queries_not_using_indexes=1`) — a much
	 * higher volume, lower-value-per-row diagnostics stream than most
	 * of DataRetentionService's leaf tables. There's no existing
	 * retention precedent for a table this write-heavy in
	 * data-retention-policy.md (the closest analogues — `login_attempts`,
	 * `proto_error_log` at 90 days — are comparatively low-volume audit
	 * trails, not a mirror of every slow/unindexed query). 14 days
	 * matches the shortest precedent already in this codebase (local
	 * backup retention, `backup-database.sh`) for high-frequency
	 * operational data whose value drops off fast: SlowQueryAlertService
	 * already alerts within a 15-minute window, and `pt-query-digest` /
	 * manual slow-log review is realistically always done against
	 * recent data, not month-old queries.
	 */
	protected const RETENTION_DAYS = 14;

	/**
	 * Name of the connection carrying the elevated, narrowly-scoped
	 * credential this pruning job needs (see class docblock). Never
	 * the runtime `default` connection.
	 */
	protected const CONNECTION = 'slowLogMaintenance';

	/**
	 * Working table names used for the rename-swap. Fixed names so the
	 * dedicated DB user's grants can be scoped to exact table names
	 * instead of a wildcard across `mysql.*`.
	 */
	protected const LIVE_TABLE = 'mysql.slow_log';
	protected const NEXT_TABLE = 'mysql.slow_log_next';
	protected const PREV_TABLE = 'mysql.slow_log_prev';

	/**
	 * Prunes rows from mysql.slow_log older than the retention window.
	 *
	 * @return int Number of expired rows removed.
	 */
	public function prune(): int
	{
		// DatabaseManager throws when the named connection is absent from
		// config (it does not return null despite Database::getConnection's
		// docblock). Catch that here so a missing/misconfigured
		// connections.slowLogMaintenance fails soft into error_log instead
		// of becoming an uncaught exception in proto_error_log.
		try
		{
			$db = Database::getConnection(self::CONNECTION);
		}
		catch (\Throwable $e)
		{
			error_log('SlowQueryLogPruneService: no ' . self::CONNECTION . ' database connection: ' . $e->getMessage());
			return 0;
		}

		if ($db === null)
		{
			error_log('SlowQueryLogPruneService: no ' . self::CONNECTION . ' database connection.');
			return 0;
		}

		try
		{
			$eligible = $this->countEligible($db);
			if ($eligible <= 0)
			{
				return 0;
			}

			return $this->swapAndPrune($db);
		}
		catch (\Throwable $e)
		{
			error_log('SlowQueryLogPruneService: prune failed: ' . $e->getMessage());
			$this->cleanupLeftovers($db);
			return 0;
		}
	}

	/**
	 * Counts rows past the retention cutoff, to skip the swap entirely
	 * on days with nothing to prune.
	 *
	 * The cutoff is computed by MariaDB itself (`NOW() - INTERVAL ? DAY`)
	 * rather than in PHP. `start_time` is written by the server's own
	 * clock, not by app code, and this web container's PHP timezone
	 * (date.timezone in php.ini) does not necessarily match the DB
	 * server's timezone — a PHP-computed cutoff (as DataRetentionService
	 * uses for its own app-written timestamp columns) would silently
	 * drift by that offset here.
	 *
	 * @param object $db
	 * @return int
	 */
	protected function countEligible(object $db): int
	{
		$row = $db->first(
			'SELECT COUNT(*) AS n FROM ' . self::LIVE_TABLE . ' WHERE start_time < (NOW() - INTERVAL ? DAY)',
			[static::RETENTION_DAYS]
		);

		return (int)($row->n ?? 0);
	}

	/**
	 * Builds a fresh replacement table seeded with the rows to keep,
	 * then atomically swaps it in for the live log table.
	 *
	 * @param object $db
	 * @return int Number of expired rows removed.
	 */
	protected function swapAndPrune(object $db): int
	{
		$this->cleanupLeftovers($db);

		$totalBefore = $this->countAll($db, self::LIVE_TABLE);

		$db->execute('CREATE TABLE ' . self::NEXT_TABLE . ' LIKE ' . self::LIVE_TABLE);
		$this->ensureIndexedEngine($db, self::NEXT_TABLE);
		$db->execute(
			'INSERT INTO ' . self::NEXT_TABLE . ' SELECT * FROM ' . self::LIVE_TABLE . ' WHERE start_time >= (NOW() - INTERVAL ? DAY)',
			[static::RETENTION_DAYS]
		);
		$kept = $this->countAll($db, self::NEXT_TABLE);

		// Single statement: the server is never without a table bound
		// to the `slow_log` name, so logging is never interrupted.
		$db->execute(
			'RENAME TABLE ' . self::LIVE_TABLE . ' TO ' . self::PREV_TABLE . ', '
			. self::NEXT_TABLE . ' TO ' . self::LIVE_TABLE
		);

		// No SELECT grant on slow_log_prev — it's only ever a RENAME
		// destination and a DROP target (see create-app-db-user.sql),
		// so the removed count is derived from tables already read
		// above rather than counting the archived table directly.
		$db->execute('DROP TABLE ' . self::PREV_TABLE);

		return max(0, $totalBefore - $kept);
	}

	/**
	 * Ensures a working table is `ENGINE=MyISAM` with indexes on
	 * `start_time` and `query_time`. Idempotent — once the live table
	 * (and therefore every subsequent `LIKE` copy of it) already carries
	 * these, this is a same-engine ALTER and two no-op ADD INDEX calls
	 * guarded by an existence check, not a real rebuild each run.
	 *
	 * @param object $db
	 * @param string $table
	 * @return void
	 */
	protected function ensureIndexedEngine(object $db, string $table): void
	{
		[$schema, $bareTable] = explode('.', $table, 2);

		$engineRow = $db->first(
			'SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
			[$schema, $bareTable]
		);
		if (strtoupper((string)($engineRow->ENGINE ?? '')) !== 'MYISAM')
		{
			$db->execute('ALTER TABLE ' . $table . ' ENGINE=MyISAM');
		}

		$existingRows = $db->fetch(
			'SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
			[$schema, $bareTable]
		);
		$existing = array_map(static fn($row) => $row->INDEX_NAME, $existingRows ?: []);

		$missing = [];
		if (!in_array('idx_start_time', $existing, true))
		{
			$missing[] = 'ADD INDEX idx_start_time (start_time)';
		}
		if (!in_array('idx_query_time', $existing, true))
		{
			$missing[] = 'ADD INDEX idx_query_time (query_time)';
		}

		if (!empty($missing))
		{
			$db->execute('ALTER TABLE ' . $table . ' ' . implode(', ', $missing));
		}
	}

	/**
	 * Counts every row in a working table.
	 *
	 * @param object $db
	 * @param string $table
	 * @return int
	 */
	protected function countAll(object $db, string $table): int
	{
		$row = $db->first('SELECT COUNT(*) AS n FROM ' . $table);
		return (int)($row->n ?? 0);
	}

	/**
	 * Drops any working tables left behind by a prior failed run, so
	 * this run starts from a clean slate.
	 *
	 * @param object $db
	 * @return void
	 */
	protected function cleanupLeftovers(object $db): void
	{
		try
		{
			$db->execute('DROP TABLE IF EXISTS ' . self::NEXT_TABLE);
			$db->execute('DROP TABLE IF EXISTS ' . self::PREV_TABLE);
		}
		catch (\Throwable $e)
		{
			error_log('SlowQueryLogPruneService: leftover cleanup failed: ' . $e->getMessage());
		}
	}
}
