<?php declare(strict_types=1);

namespace Common\Automation\Models;

use Proto\Models\Model;

/**
 * CronJob
 *
 * Registry row for a scheduled system cron with heartbeat fields.
 *
 * @property int $id
 * @property string $jobKey
 * @property string $name
 * @property string $routineClass
 * @property string $schedule
 * @property string $logMode
 * @property int $successRetentionDays
 * @property int $failureRetentionDays
 * @property string|null $logFile
 * @property int $enabled
 * @property string|null $lastRunAt
 * @property string|null $lastStatus
 * @property int|null $lastDurationMs
 * @property string|null $lastError
 * @property int $consecutiveSuccesses
 * @property int $totalRuns
 * @property int $totalFailures
 * @property string $createdAt
 * @property string $updatedAt
 *
 * @package Common\Automation\Models
 */
class CronJob extends Model
{
	/**
	 * @var string|null
	 */
	protected static ?string $tableName = 'cron_jobs';

	/**
	 * @var string|null
	 */
	protected static ?string $alias = 'cj';

	/**
	 * @var array<string>
	 */
	protected static array $fields = [
		'id',
		'jobKey',
		'name',
		'routineClass',
		'schedule',
		'logMode',
		'successRetentionDays',
		'failureRetentionDays',
		'logFile',
		'enabled',
		'lastRunAt',
		'lastStatus',
		'lastDurationMs',
		'lastError',
		'consecutiveSuccesses',
		'totalRuns',
		'totalFailures',
		'createdAt',
		'updatedAt',
	];
}
