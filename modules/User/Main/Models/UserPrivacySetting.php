<?php declare(strict_types=1);
namespace Modules\User\Main\Models;

use Proto\Models\Model;

/**
 * UserPrivacySetting
 *
 * This is the model class for the "user_privacy_settings" table.
 * Stores per-user privacy configuration such as profile and content visibility.
 *
 * @property int $userId
 * @property string $profileVisibility
 * @property string $garageVisibility
 * @property string $postVisibility
 * @property string $nameDisplay
 * @property int $contactSync
 * @property int $showOnlineStatus
 * @property string $createdAt
 * @property string|null $updatedAt
 *
 * @package Modules\User\Main\Models
 */
class UserPrivacySetting extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'user_privacy_settings';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ups';

	/**
	 * The primary key field name.
	 *
	 * @var string
	 */
	protected static string $idKeyName = 'userId';

	/**
	 * @var array<string> $fields
	 */
	protected static array $fields = [
		'userId',
		'profileVisibility',
		'garageVisibility',
		'postVisibility',
		'nameDisplay',
		'contactSync',
		'showOnlineStatus',
		'createdAt',
		'updatedAt'
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['userId', 'createdAt'];
}
