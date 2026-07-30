<?php declare(strict_types=1);

namespace Common\Automation\Processes;

use Common\Automation\Models\CronJob;
use Common\Automation\Models\CronRun;
use Proto\Automation\Processes\Routine;

/**
 * CronCleanupRoutine
 *
 * Deletes expired cron_runs rows based on each job's retention policy.
 */
class CronCleanupRoutine extends Routine
{
	/**
	 * @var bool
	 */
	protected bool $setLimits = true;

	/**
	 * @var string
	 */
	protected string $memoryLimit = '256M';

	/**
	 * @var int
	 */
	protected int $timeLimit = 600;

	/**
	 * Execute cleanup.
	 *
	 * @return void
	 */
	protected function process(): void
	{
		$jobs = CronJob::fetchWhere([]);
		$totalDeleted = 0;

		foreach ($jobs as $job)
		{
			$totalDeleted += $this->cleanupSuccessRuns($job);
			$totalDeleted += $this->cleanupFailedRuns($job);
		}

		if ($totalDeleted > 0)
		{
			error_log('CronCleanupRoutine: removed ' . $totalDeleted . ' expired cron run rows at ' . date('Y-m-d H:i:s'));
		}
	}

	/**
	 * Delete expired successful runs for a job.
	 *
	 * @param object $job
	 * @return int
	 */
	protected function cleanupSuccessRuns(object $job): int
	{
		$days = (int)($job->successRetentionDays ?? 90);
		$cutoff = date('Y-m-d H:i:s', time() - ($days * 86400));

		$rows = CronRun::fetchWhere([
			'cronJobId' => (int)$job->id,
			'status' => 'success',
			['createdAt', '<', $cutoff],
		]);

		return $this->deleteRows($rows);
	}

	/**
	 * Delete expired failed runs for a job.
	 *
	 * @param object $job
	 * @return int
	 */
	protected function cleanupFailedRuns(object $job): int
	{
		$days = (int)($job->failureRetentionDays ?? 90);
		$cutoff = date('Y-m-d H:i:s', time() - ($days * 86400));

		$rows = CronRun::fetchWhere([
			'cronJobId' => (int)$job->id,
			'status' => 'failed',
			['createdAt', '<', $cutoff],
		]);

		return $this->deleteRows($rows);
	}

	/**
	 * Delete run rows.
	 *
	 * @param array<int,object> $rows
	 * @return int
	 */
	protected function deleteRows(array $rows): int
	{
		$deleted = 0;

		foreach ($rows as $row)
		{
			$run = new CronRun((object)['id' => $row->id]);
			if ($run->delete())
			{
				$deleted++;
			}
		}

		return $deleted;
	}
}
