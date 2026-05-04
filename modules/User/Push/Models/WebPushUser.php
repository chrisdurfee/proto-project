<?php declare(strict_types=1);

namespace Modules\User\Push\Models;

use Modules\User\Push\Storage\WebPushUserStorage;
use Proto\Models\Model;
use Proto\Storage\DataTypes\JsonType;

/**
 * WebPushUser
 *
 * Handles the web push user model.
 *
 * @package Modules\User\Push\Models
 */
class WebPushUser extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'web_push_users';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'wp';

	/**
	 * @var array<string, class-string> $dataTypes
	 */
	protected static array $dataTypes = [
		'authKeys' => JsonType::class,
	];

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'endpoint',
		'authKeys',
		'status'
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['createdAt', 'userId'];

	/**
	 * @var string $storageType
	 */
	protected static string $storageType = WebPushUserStorage::class;
}
