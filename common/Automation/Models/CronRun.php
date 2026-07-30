<?php declare(strict_types=1);

namespace Common\Automation\Models;

use Proto\Models\Model;

/**
 * CronRun
 *
 * One execution record for a cron job.
 *
 * @property int $id
 * @property int $cronJobId
 * @property string $status
 * @property string $startedAt
 * @property string|null $finishedAt
 * @property int|null $durationMs
 * @property string|null $errorMessage
 * @property string $createdAt
 *
 * @package Common\Automation\Models
 */
class CronRun extends Model
{
	/**
	 * @var string|null
	 */
	protected static ?string $tableName = 'cron_runs';

	/**
	 * @var string|null
	 */
	protected static ?string $alias = 'cr';

	/**
	 * @var array<string>
	 */
	protected static array $fields = [
		'id',
		'cronJobId',
		'status',
		'startedAt',
		'finishedAt',
		'durationMs',
		'errorMessage',
		'createdAt',
	];
}
