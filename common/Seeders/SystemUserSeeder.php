<?php declare(strict_types=1);
namespace Common\Seeders;

use Proto\Database\Seeders\Seeder;
use Common\Utils\Uuid;

/**
 * SystemUserSeeder
 *
 * Idempotently seeds the proto-bot system user used for bot/system
 * activity. Skips if a user with the proto-bot username already exists.
 */
class SystemUserSeeder extends Seeder
{
	/**
	 * The reserved username for the system bot account.
	 */
	private const SYSTEM_USERNAME = 'proto-bot';

	/**
	 * Run the seeder.
	 *
	 * @return void
	 */
	public function run(): void
	{
		$db = $this->getConnection();

		$existing = $db->first(
			"SELECT id FROM users WHERE username = ? LIMIT 1",
			[self::SYSTEM_USERNAME]
		);

		if ($existing)
		{
			return;
		}

		$now = date('Y-m-d H:i:s');

		$db->insert('users', (object)[
			'uuid' => Uuid::v4(),
			'username' => self::SYSTEM_USERNAME,
			'password' => password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT),
			'first_name' => 'Proto',
			'last_name' => 'Bot',
			'display_name' => 'Proto Bot',
			'status' => 'system',
			'enabled' => 1,
			'verified' => 1,
			'created_at' => $now,
			'updated_at' => $now,
		]);
	}
}
