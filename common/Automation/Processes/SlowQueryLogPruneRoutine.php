<?php declare(strict_types=1);

namespace Common\Automation\Processes;

use Common\Services\SlowQueryLogPruneService;
use Proto\Automation\Processes\Routine;

/**
 * SlowQueryLogPruneRoutine
 *
 * Daily cron entry point for pruning mysql.slow_log. All logic lives
 * in SlowQueryLogPruneService (routines die() on destruct, so they
 * must only run as dedicated cron processes — never construct one
 * in-request or in tests).
 *
 * @package Common\Automation\Processes
 */
class SlowQueryLogPruneRoutine extends Routine
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
	protected int $timeLimit = 1800;

	/**
	 * Prune expired rows from mysql.slow_log.
	 *
	 * @return void
	 */
	protected function process(): void
	{
		$removed = (new SlowQueryLogPruneService())->prune();
		if ($removed > 0)
		{
			error_log('SlowQueryLogPruneRoutine: removed ' . $removed . ' expired mysql.slow_log rows at ' . date('Y-m-d H:i:s'));
		}
	}
}
