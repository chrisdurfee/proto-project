<?php declare(strict_types=1);

/**
 * run-routine.php
 *
 * Thin wrapper around Proto's Cron runner that ensures the project
 * autoloader is loaded before the routine class is resolved.
 *
 * Distributed concurrency safety:
 * When the application is scaled horizontally (many web/scheduler
 * containers), the same cron entry fires inside every container at the
 * same instant. To guarantee a routine never runs twice concurrently
 * across the fleet, each run is wrapped in a MySQL named advisory lock
 * (GET_LOCK) keyed by the routine class. A container that cannot acquire
 * the lock immediately (timeout 0) simply skips — another instance is
 * already running that routine. The lock is session-scoped and auto-
 * releases if the holding process dies, so a crash can never wedge the job.
 *
 * Usage (from project root):
 *   php infrastructure/scripts/run-routine.php "Fully\\Qualified\\RoutineClass"
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Common\Automation\Services\CronRunLogger;
use Proto\Automation\Process;
use Proto\Database\Database;
use Proto\Utils\Strings;

/**
 * Build a MySQL-safe (<= 64 char) named lock key for a routine class.
 *
 * @param string $routineClass
 * @return string
 */
function cronLockKey(string $routineClass): string
{
	return 'proto_cron_' . substr(sha1($routineClass), 0, 40);
}

/**
 * Acquire a non-blocking, session-scoped advisory lock for this routine.
 *
 * Returns the sticky connection holding the lock, or false when another
 * instance already holds it, or null when no lock connection is available
 * (degraded mode — proceed without distributed locking so a transient
 * locking-infra issue never halts automations entirely).
 *
 * @param string $lockKey
 * @return object|false|null
 */
function acquireCronLock(string $lockKey)
{
	// caching=true keeps a single sticky connection so GET_LOCK / RELEASE_LOCK
	// target the same session and the lock is held for this process only.
	$db = Database::getConnection('default', true);
	if ($db === null)
	{
		return null;
	}

	$result = $db->first('SELECT GET_LOCK(?, 0) AS locked', [$lockKey]);
	if ($result === null || (int)($result->locked ?? 0) !== 1)
	{
		return false;
	}

	return $db;
}

$routine = $argv[1] ?? null;
if (empty($routine))
{
	fwrite(STDERR, "No routine was setup.\n");
	exit(1);
}

$parts = explode('/', $routine);
foreach ($parts as $key => $value)
{
	$parts[$key] = Strings::pascalCase($value);
}
$routineClass = implode('\\', $parts);

$routineInstance = Process::getRoutine($routineClass);
if (empty($routineInstance))
{
	fwrite(STDERR, "The routine was not found: {$routineClass}\n");
	exit(1);
}

$lockKey = cronLockKey($routineClass);
$lockConnection = acquireCronLock($lockKey);

if ($lockConnection === false)
{
	// Another container/instance is already running this routine.
	fwrite(STDOUT, "Skipped {$routineClass}: another instance holds the lock.\n");
	exit(0);
}

$logger = new CronRunLogger();
$logger->start($routineClass);

try
{
	$routineInstance->run();
	$logger->finishSuccess();
}
catch (\Throwable $e)
{
	$logger->finishFailure($e);
	throw $e;
}
finally
{
	if (is_object($lockConnection))
	{
		$lockConnection->first('SELECT RELEASE_LOCK(?) AS released', [$lockKey]);
	}
}
