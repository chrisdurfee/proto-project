<?php declare(strict_types=1);
namespace Modules\Auth\Models;

use Proto\Models\Model;

/**
 * LoginLog
 *
 * Tracks the user's login activity.
 *
 * @package Modules\Auth\Models
 */
class LoginLog extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'login_log';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'l';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'direction',
		'ip'
	];
}