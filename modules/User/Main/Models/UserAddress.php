<?php declare(strict_types=1);
namespace Modules\User\Main\Models;

use Proto\Models\Model;

/**
 * UserAddress
 *
 * @package Modules\User\Models
 */
class UserAddress extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'user_address';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ua';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'street1',
		'street2',
		'city',
		'state',
		'postalCode',
		'country',
		'isPrimary'
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['createdAt', 'userId'];
}