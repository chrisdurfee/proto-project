<?php declare(strict_types=1);

namespace Modules\Developer\Controllers;

use Modules\Developer\Auth\Policies\OperationsPolicy;
use Proto\Database\Database;
use Proto\Http\Router\Request;

/**
 * SlowQueryController
 *
 * Lists rows from MariaDB's mysql.slow_log for the CRM Platform /
 * Developer operations tooling. Requires log_output to include TABLE
 * (see infrastructure/config/mariadb/conf.d/performance.cnf).
 *
 * @package Modules\Developer\Controllers
 */
class SlowQueryController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = OperationsPolicy::class;

	/**
	 * Allowed list modes (sent as the `status` query param to mirror
	 * the Errors page filter pattern).
	 *
	 * @var array<int, string>
	 */
	private const MODES = ['genuine', 'all', 'unindexed'];

	/**
	 * List slow-log rows with pagination and mode filtering.
	 *
	 * GET /api/developer/slow-query
	 *   ?filter={"mode":"genuine"}
	 *   &offset=0&limit=50
	 *   &search=partners
	 *   &orderBy={"startTime":"DESC"}
	 *
	 * @param Request $request
	 * @return object
	 */
	public function all(Request $request): object
	{
		$db = Database::getConnection('default');
		if ($db === null)
		{
			return $this->error('Database connection unavailable.');
		}

		$inputs = $this->getAllInputs($request);
		$mode = $this->resolveMode($inputs->filter ?? null);
		$longQueryTime = $this->getLongQueryTime($db);
		$orderBy = $this->resolveOrderBy($inputs->orderBy ?? null);
		$search = trim((string)($inputs->search ?? ''));
		$offset = max(0, (int)$inputs->offset);
		$limit = max(1, min((int)$inputs->limit, $this->maxLimit));

		[$whereSql, $params] = $this->buildWhere($mode, $longQueryTime, $search);

		try
		{
			$rows = $db->fetch(
				"SELECT
					start_time AS startTime,
					user_host AS userHost,
					(TIME_TO_SEC(query_time) + MICROSECOND(query_time) / 1000000) AS queryTime,
					(TIME_TO_SEC(lock_time) + MICROSECOND(lock_time) / 1000000) AS lockTime,
					rows_sent AS rowsSent,
					rows_examined AS rowsExamined,
					rows_affected AS rowsAffected,
					db AS dbName,
					sql_text AS sqlText,
					thread_id AS threadId,
					server_id AS serverId
				FROM mysql.slow_log
				WHERE {$whereSql}
				ORDER BY {$orderBy}
				LIMIT ?, ?",
				array_merge($params, [$offset, $limit])
			);
		}
		catch (\Throwable $e)
		{
			error_log('SlowQueryController: list failed: ' . $e->getMessage());
			return $this->error('Failed to read the slow query log. Ensure log_output includes TABLE.');
		}

		$formatted = [];
		foreach ($rows ?: [] as $row)
		{
			$formatted[] = $this->formatRow($row);
		}

		$logOutput = $this->getLogOutput($db);

		return $this->response((object)[
			'rows' => $formatted,
			'logOutput' => $logOutput,
			'tableEnabled' => str_contains(strtoupper($logOutput), 'TABLE'),
			'longQueryTime' => $longQueryTime,
			'mode' => $mode
		]);
	}

	/**
	 * Resolves the list mode from the filter object (Clients-page pattern:
	 * filter.mode via built-in all()).
	 *
	 * @param mixed $filter
	 * @return string
	 */
	protected function resolveMode(mixed $filter): string
	{
		$mode = 'genuine';
		if (is_object($filter) && isset($filter->mode))
		{
			$mode = strtolower(trim((string)$filter->mode));
		}
		elseif (is_array($filter) && isset($filter['mode']))
		{
			$mode = strtolower(trim((string)$filter['mode']));
		}

		if (!in_array($mode, self::MODES, true))
		{
			return 'genuine';
		}

		return $mode;
	}

	/**
	 * Builds the WHERE clause and bound params for the list query.
	 *
	 * @param string $mode
	 * @param float $longQueryTime
	 * @param string $search
	 * @return array{0: string, 1: array<int, mixed>}
	 */
	protected function buildWhere(string $mode, float $longQueryTime, string $search): array
	{
		$parts = [
			// MariaDB prefixes every logged statement with SET timestamp=...;
			// those rows are noise and never useful in the UI.
			"sql_text NOT LIKE 'SET timestamp=%'",
			// mariadb-dump / mysqldump full-table reads always inject this
			// hint. Expected backup noise, not app regressions.
			"sql_text NOT LIKE '%SQL_NO_CACHE%'"
		];
		$params = [];

		if ($mode === 'genuine')
		{
			$parts[] = 'query_time >= SEC_TO_TIME(?)';
			$params[] = $longQueryTime;
		}
		elseif ($mode === 'unindexed')
		{
			$parts[] = 'query_time < SEC_TO_TIME(?)';
			$params[] = $longQueryTime;
		}

		if ($search !== '')
		{
			$parts[] = 'sql_text LIKE ?';
			$params[] = '%' . $search . '%';
		}

		return [implode(' AND ', $parts), $params];
	}

	/**
	 * Resolves a safe ORDER BY clause from the request orderBy modifier.
	 *
	 * @param mixed $orderBy
	 * @return string
	 */
	protected function resolveOrderBy(mixed $orderBy): string
	{
		$map = [
			'queryTime' => 'query_time',
			'startTime' => 'start_time',
			'rowsExamined' => 'rows_examined',
			'rowsSent' => 'rows_sent',
			'lockTime' => 'lock_time'
		];

		if (is_object($orderBy))
		{
			$orderBy = (array)$orderBy;
		}

		if (is_array($orderBy) && count($orderBy) > 0)
		{
			$key = (string)array_key_first($orderBy);
			$direction = strtoupper((string)$orderBy[$key]) === 'ASC' ? 'ASC' : 'DESC';
			if (isset($map[$key]))
			{
				return $map[$key] . ' ' . $direction;
			}
		}

		return 'start_time DESC';
	}

	/**
	 * Formats a raw slow_log row for the API response.
	 *
	 * @param object $row
	 * @return object
	 */
	protected function formatRow(object $row): object
	{
		$sqlText = (string)($row->sqlText ?? '');
		$startTime = (string)($row->startTime ?? '');
		$threadId = (int)($row->threadId ?? 0);
		$queryTime = (float)($row->queryTime ?? 0);

		return (object)[
			'id' => md5($startTime . '|' . $threadId . '|' . substr($sqlText, 0, 200)),
			'startTime' => $startTime,
			'userHost' => (string)($row->userHost ?? ''),
			'queryTime' => $queryTime,
			'queryTimeLabel' => $this->formatDuration($queryTime),
			'lockTime' => (float)($row->lockTime ?? 0),
			'lockTimeLabel' => $this->formatDuration((float)($row->lockTime ?? 0)),
			'rowsSent' => (int)($row->rowsSent ?? 0),
			'rowsExamined' => (int)($row->rowsExamined ?? 0),
			'rowsAffected' => (int)($row->rowsAffected ?? 0),
			'dbName' => (string)($row->dbName ?? ''),
			'sqlText' => $sqlText,
			'sqlPreview' => $this->previewSql($sqlText),
			'threadId' => $threadId,
			'serverId' => (int)($row->serverId ?? 0)
		];
	}

	/**
	 * Short preview of the SQL for the table column.
	 *
	 * @param string $sql
	 * @return string
	 */
	protected function previewSql(string $sql): string
	{
		$flat = preg_replace('/\s+/', ' ', trim($sql)) ?? '';
		if (strlen($flat) <= 120)
		{
			return $flat;
		}

		return substr($flat, 0, 117) . '...';
	}

	/**
	 * Human-readable duration label.
	 *
	 * @param float $seconds
	 * @return string
	 */
	protected function formatDuration(float $seconds): string
	{
		if ($seconds < 0.001)
		{
			return '<1ms';
		}

		if ($seconds < 1)
		{
			return round($seconds * 1000) . 'ms';
		}

		if ($seconds < 60)
		{
			return number_format($seconds, 2) . 's';
		}

		$minutes = (int)floor($seconds / 60);
		$remain = $seconds - ($minutes * 60);
		return $minutes . 'm ' . number_format($remain, 1) . 's';
	}

	/**
	 * Reads @@long_query_time.
	 *
	 * @param object $db
	 * @return float
	 */
	protected function getLongQueryTime(object $db): float
	{
		try
		{
			$row = $db->first('SELECT @@long_query_time AS value');
			return (float)($row->value ?? 1.0);
		}
		catch (\Throwable)
		{
			return 1.0;
		}
	}

	/**
	 * Reads @@log_output.
	 *
	 * @param object $db
	 * @return string
	 */
	protected function getLogOutput(object $db): string
	{
		try
		{
			$row = $db->first('SELECT @@log_output AS value');
			return (string)($row->value ?? 'FILE');
		}
		catch (\Throwable)
		{
			return 'FILE';
		}
	}
}
