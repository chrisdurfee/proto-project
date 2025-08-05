<?php declare(strict_types=1);
namespace Modules\User\Models;

use Proto\Models\Model;

/**
 * NotificationPreference
 *
 * This is the model class for table "notification_preferences".
 *
 * @package Modules\User\Models
 */
class NotificationPreference extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'notification_preferences';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'np';

	/**
	 * Identifier key name.
	 *
	 * @var string
	 */
	protected static string $idKeyName = 'userId';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'createdAt',
		'updatedAt',
		'userId',
		'allowEmail',
		'allowSms',
		'allowPush'
	];

}