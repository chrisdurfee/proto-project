<?php declare(strict_types=1);

namespace Common\Automation\Services;

use Common\Automation\Models\CronJob;
use Proto\Utils\Strings;

/**
 * CronRegistryService
 *
 * Syncs cron_jobs rows from infrastructure/docker/cron definitions.
 */
class CronRegistryService
{
	/**
	 * Default retention windows by log mode.
	 */
	private const RETENTION = [
		'full' => ['success' => 90, 'failure' => 90],
		'high_frequency' => ['success' => 14, 'failure' => 90],
	];

	/**
	 * Sync all cron job definitions from disk into cron_jobs.
	 *
	 * @return int Number of jobs synced.
	 */
	public static function syncAll(): int
	{
		$directory = self::cronDirectory();
		if (!is_dir($directory))
		{
			return 0;
		}

		$synced = 0;
		foreach (glob($directory . '/*') ?: [] as $path)
		{
			if (!is_file($path))
			{
				continue;
			}

			foreach (self::parseCronFile($path) as $definition)
			{
				self::upsertJob($definition);
				$synced++;
			}
		}

		return $synced;
	}

	/**
	 * Resolve the cron definitions directory.
	 *
	 * @return string
	 */
	public static function cronDirectory(): string
	{
		return dirname(__DIR__, 3) . '/infrastructure/docker/cron';
	}

	/**
	 * Parse a cron file into one or more registry definitions.
	 *
	 * @param string $path
	 * @return array<int, object>
	 */
	public static function parseCronFile(string $path): array
	{
		$content = file_get_contents($path);
		if ($content === false)
		{
			return [];
		}

		$fileKey = basename($path);
		$definitions = [];
		$routineLines = [];

		foreach (explode("\n", $content) as $line)
		{
			$line = trim($line);
			if ($line === '' || str_starts_with($line, '#'))
			{
				continue;
			}

			if (!str_contains($line, 'run-routine.php'))
			{
				continue;
			}

			if (!preg_match(
				'/^(\S+\s+\S+\s+\S+\s+\S+\s+\S+)\s+\S+\s+cd\s+\S+\s+&&\s+php\s+.+?run-routine\.php\s+"((?:\\\\.|[^"\\\\])+)"/',
				$line,
				$matches
			))
			{
				continue;
			}

			$routineLines[] = (object)[
				'schedule' => $matches[1],
				'routineClass' => stripcslashes($matches[2]),
			];
		}

		$multiEntry = count($routineLines) > 1;

		foreach ($routineLines as $entry)
		{
			$jobKey = $fileKey;
			if ($multiEntry)
			{
				$jobKey .= '-' . self::routineToJobKey($entry->routineClass);
			}

			$logMode = self::inferLogMode($entry->schedule);
			$retention = self::RETENTION[$logMode];
			$logFile = '/var/log/' . $fileKey . '.log';

			$definitions[] = (object)[
				'jobKey' => $jobKey,
				'name' => self::formatJobName($jobKey),
				'routineClass' => $entry->routineClass,
				'schedule' => $entry->schedule,
				'logMode' => $logMode,
				'successRetentionDays' => $retention['success'],
				'failureRetentionDays' => $retention['failure'],
				'logFile' => $logFile,
			];
		}

		return $definitions;
	}

	/**
	 * Infer logging mode from a cron schedule expression.
	 *
	 * @param string $schedule
	 * @return string
	 */
	public static function inferLogMode(string $schedule): string
	{
		$minute = explode(' ', trim($schedule))[0] ?? '';

		if ($minute === '*')
		{
			return 'high_frequency';
		}

		if (preg_match('/^\*\/(\d+)$/', $minute, $matches))
		{
			return ((int)$matches[1]) <= 15 ? 'high_frequency' : 'full';
		}

		return 'full';
	}

	/**
	 * Upsert a cron job definition.
	 *
	 * @param object $definition
	 * @return void
	 */
	public static function upsertJob(object $definition): void
	{
		$existing = CronJob::getBy(['routineClass' => $definition->routineClass])
			?? CronJob::getBy(['jobKey' => $definition->jobKey]);

		if ($existing)
		{
			self::updateJob((int)$existing->id, $definition);
			return;
		}

		// Use merge() (REPLACE INTO) instead of add() (INSERT) so that
		// a concurrent syncAll() call from another cron process hitting
		// the same unique index on job_key/routine_class does not
		// produce a logged duplicate-key error. For brand-new rows,
		// there are no cron_runs references, so REPLACE INTO is safe.
		$job = new CronJob((object)[
			'jobKey' => $definition->jobKey,
			'name' => $definition->name,
			'routineClass' => $definition->routineClass,
			'schedule' => $definition->schedule,
			'logMode' => $definition->logMode,
			'successRetentionDays' => $definition->successRetentionDays,
			'failureRetentionDays' => $definition->failureRetentionDays,
			'logFile' => $definition->logFile,
			'enabled' => 1,
		]);
		$job->merge();
	}

	/**
	 * Update an existing cron job row with a fresh definition.
	 *
	 * @param int $id
	 * @param object $definition
	 * @return void
	 */
	private static function updateJob(int $id, object $definition): void
	{
		$job = new CronJob((object)[
			'id' => $id,
			'jobKey' => $definition->jobKey,
			'name' => $definition->name,
			'routineClass' => $definition->routineClass,
			'schedule' => $definition->schedule,
			'logMode' => $definition->logMode,
			'successRetentionDays' => $definition->successRetentionDays,
			'failureRetentionDays' => $definition->failureRetentionDays,
			'logFile' => $definition->logFile,
		]);
		$job->update();
	}

	/**
	 * Ensure a cron job row exists for an invoked routine class.
	 *
	 * @param string $routineClass
	 * @return object
	 */
	public static function ensureJobForRoutine(string $routineClass): object
	{
		self::syncAll();

		$job = CronJob::getBy(['routineClass' => $routineClass]);
		if ($job)
		{
			return $job;
		}

		$jobKey = self::routineToJobKey($routineClass);
		$adhoc = new CronJob((object)[
			'jobKey' => 'manual-' . $jobKey,
			'name' => self::formatJobName($jobKey),
			'routineClass' => $routineClass,
			'schedule' => 'manual',
			'logMode' => 'full',
			'successRetentionDays' => self::RETENTION['full']['success'],
			'failureRetentionDays' => self::RETENTION['full']['failure'],
			'enabled' => 1,
		]);
		$adhoc->add();

		$created = CronJob::getBy(['routineClass' => $routineClass]);
		return $created ?? $adhoc;
	}

	/**
	 * Build a stable key from a routine class name.
	 *
	 * @param string $routineClass
	 * @return string
	 */
	protected static function routineToJobKey(string $routineClass): string
	{
		$parts = explode('\\', $routineClass);
		$short = end($parts) ?: $routineClass;
		return Strings::kebabCase($short) ?: 'manual-routine';
	}

	/**
	 * Format a display name from a job key.
	 *
	 * @param string $jobKey
	 * @return string
	 */
	protected static function formatJobName(string $jobKey): string
	{
		$label = str_replace(['-', '_'], ' ', $jobKey);
		return ucwords($label);
	}
}
