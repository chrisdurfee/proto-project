<?php declare(strict_types=1);

namespace Common\Automation\Services;

use Common\Automation\Models\CronJob;
use Common\Automation\Models\CronRun;

/**
 * CronRunLogger
 *
 * Persists cron execution telemetry and heartbeat fields.
 */
class CronRunLogger
{
	/**
	 * @var float|null
	 */
	protected ?float $startedAt = null;

	/**
	 * @var int|null
	 */
	protected ?int $runId = null;

	/**
	 * @var object|null
	 */
	protected ?object $job = null;

	/**
	 * Begin tracking a cron run.
	 *
	 * @param string $routineClass
	 * @return void
	 */
	public function start(string $routineClass): void
	{
		$this->job = CronRegistryService::ensureJobForRoutine($routineClass);
		$this->startedAt = microtime(true);

		$startedAt = date('Y-m-d H:i:s');
		$run = new CronRun((object)[
			'cronJobId' => $this->job->id,
			'status' => 'running',
			'startedAt' => $startedAt,
		]);
		$run->add();
		$this->runId = (int)$run->id;

		$job = new CronJob((object)[
			'id' => $this->job->id,
			'lastRunAt' => $startedAt,
			'lastStatus' => 'running',
			'lastError' => null,
		]);
		$job->update();
	}

	/**
	 * Mark the current run as successful.
	 *
	 * @return void
	 */
	public function finishSuccess(): void
	{
		if ($this->runId === null || $this->job === null)
		{
			return;
		}

		$durationMs = $this->durationMs();
		$finishedAt = date('Y-m-d H:i:s');

		$run = new CronRun((object)[
			'id' => $this->runId,
			'status' => 'success',
			'finishedAt' => $finishedAt,
			'durationMs' => $durationMs,
			'errorMessage' => null,
		]);
		$run->update();

		$jobRow = CronJob::get($this->job->id);
		$consecutive = ((int)($jobRow->consecutiveSuccesses ?? 0)) + 1;

		$job = new CronJob((object)[
			'id' => $this->job->id,
			'lastRunAt' => $finishedAt,
			'lastStatus' => 'success',
			'lastDurationMs' => $durationMs,
			'lastError' => null,
			'consecutiveSuccesses' => $consecutive,
			'totalRuns' => ((int)($jobRow->totalRuns ?? 0)) + 1,
		]);
		$job->update();
	}

	/**
	 * Mark the current run as failed.
	 *
	 * @param \Throwable $error
	 * @return void
	 */
	public function finishFailure(\Throwable $error): void
	{
		if ($this->runId === null || $this->job === null)
		{
			return;
		}

		$durationMs = $this->durationMs();
		$finishedAt = date('Y-m-d H:i:s');
		$message = $error->getMessage();

		$run = new CronRun((object)[
			'id' => $this->runId,
			'status' => 'failed',
			'finishedAt' => $finishedAt,
			'durationMs' => $durationMs,
			'errorMessage' => $message,
		]);
		$run->update();

		$jobRow = CronJob::get($this->job->id);

		$job = new CronJob((object)[
			'id' => $this->job->id,
			'lastRunAt' => $finishedAt,
			'lastStatus' => 'failed',
			'lastDurationMs' => $durationMs,
			'lastError' => $message,
			'consecutiveSuccesses' => 0,
			'totalRuns' => ((int)($jobRow->totalRuns ?? 0)) + 1,
			'totalFailures' => ((int)($jobRow->totalFailures ?? 0)) + 1,
		]);
		$job->update();
	}

	/**
	 * Compute elapsed milliseconds for the active run.
	 *
	 * @return int
	 */
	protected function durationMs(): int
	{
		if ($this->startedAt === null)
		{
			return 0;
		}

		return (int)round((microtime(true) - $this->startedAt) * 1000);
	}
}
