<?php declare(strict_types=1);
namespace Modules\Auth\Models;

use Modules\Auth\Storage\LoginAttemptStorage;
use Proto\Models\Model;

/**
 * LoginAttempt
 *
 * @package Modules\Auth\Models
 */
class LoginAttempt extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'login_attempts';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'a';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'ipAddress',
		'usernameId'
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['createdAt', 'ipAddress', 'usernameId'];

	/**
	 * Define joins for the User model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		$builder->belongsTo(LoginAttemptUsername::class, fields: ['username'])
			->on(['usernameId', 'id']);
	}

	/**
	 * @var string $storageType
	 */
	protected static string $storageType = LoginAttemptStorage::class;

	/**
	 * Count the number of recent login attempts for a given IP and username.
	 *
	 * @param string $ipAddress
	 * @param string $username
	 * @return int
	 */
	public static function countAttempts(string $ipAddress, string $username): int
	{
		$dateTime = date('Y-m-d H:i:s');

		$row = static::builder()
			->select([['COUNT(*)'], 'total'])
			->join(function($joins)
			{
				$joins->left('login_attempt_usernames', 'lu')
					->on('a.username_id = lu.id');
			})
			->where(
				'a.ip_address = ?',
				'lu.username = ?',
				"a.created_at >= DATE_SUB('{$dateTime}', INTERVAL 15 MINUTE)"
			)
			->first([
				$ipAddress,
				$username
			]);

		return (int)($row->total ?? 0);
	}
}