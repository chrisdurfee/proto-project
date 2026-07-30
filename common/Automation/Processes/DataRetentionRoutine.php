<?php declare(strict_types=1);

namespace Common\Automation\Processes;

use Common\Services\DataRetentionService;
use Proto\Automation\Processes\Routine;

/**
 * DataRetentionRoutine
 *
 * Daily cron entry point for the data retention sweep. All logic lives
 * in DataRetentionService (routines die() on destruct, so they must
 * only run as dedicated cron processes — never construct one in-request
 * or in tests).
 *
 * @package Common\Automation\Processes
 */
class DataRetentionRoutine extends Routine
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
	 * Sweep every policy table.
	 *
	 * @return void
	 */
	protected function process(): void
	{
		$total = (new DataRetentionService())->sweep();
		if ($total > 0)
		{
			error_log('DataRetentionRoutine: removed ' . $total . ' expired rows at ' . date('Y-m-d H:i:s'));
		}
	}
}
