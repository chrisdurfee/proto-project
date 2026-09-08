<?php declare(strict_types=1);

namespace Common\Automation\Processes;

use Common\Services\SlowQueryAlertService;
use Proto\Automation\Processes\Routine;

/**
 * SlowQueryAlertRoutine
 *
 * Cron entry point for the slow-query spike check. All logic lives in
 * SlowQueryAlertService (routines die() on destruct, so they must only
 * run as dedicated cron processes — never construct one in-request or
 * in tests).
 *
 * @package Common\Automation\Processes
 */
class SlowQueryAlertRoutine extends Routine
{
	/**
	 * @var bool
	 */
	protected bool $setLimits = true;

	/**
	 * @var string
	 */
	protected string $memoryLimit = '128M';

	/**
	 * @var int
	 */
	protected int $timeLimit = 120;

	/**
	 * Check mysql.slow_log for a spike in genuinely slow queries and
	 * alert if found.
	 *
	 * @return void
	 */
	protected function process(): void
	{
		$alerted = (new SlowQueryAlertService())->checkAndAlert();
		if ($alerted)
		{
			error_log('SlowQueryAlertRoutine: alert sent at ' . date('Y-m-d H:i:s'));
		}
	}
}
