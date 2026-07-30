<?php declare(strict_types=1);

namespace Common\Automation\Processes;

use Common\Services\ErrorLogAlertService;
use Proto\Automation\Processes\Routine;

/**
 * ErrorLogAlertRoutine
 *
 * Cron entry point for the error-log spike check. All logic lives in
 * ErrorLogAlertService (routines die() on destruct, so they must only
 * run as dedicated cron processes — never construct one in-request or
 * in tests).
 *
 * @package Common\Automation\Processes
 */
class ErrorLogAlertRoutine extends Routine
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
	 * Check proto_error_log for a spike and alert if found.
	 *
	 * @return void
	 */
	protected function process(): void
	{
		$alerted = (new ErrorLogAlertService())->checkAndAlert();
		if ($alerted)
		{
			error_log('ErrorLogAlertRoutine: alert sent at ' . date('Y-m-d H:i:s'));
		}
	}
}
