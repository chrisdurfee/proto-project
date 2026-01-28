<?php declare(strict_types=1);
namespace Modules\User\Main\Models;

use Modules\User\Main\Storage\EmailVerificationStorage;
use Proto\Models\Model;

/**
 * EmailVerification
 *
 * @property int $id
 * @property string $createdAt
 * @property string|null $updatedAt
 * @property int $userId
 * @property string $requestId
 * @property string $status
 *
 * @package Modules\User\Models
 */
class EmailVerification extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'email_verification';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'e';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'requestId',
		'status'
	];

	/**
	 * @var string $storageType
	 */
	protected static string $storageType = EmailVerificationStorage::class;
}