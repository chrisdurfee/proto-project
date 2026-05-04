<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * FixEmailUsernames
 *
 * One-time data fix: any user whose username looks like an email address
 * (contains '@') gets a proper slug handle generated from their first/last name.
 * Duplicate slugs get a random numeric suffix.
 */
class FixEmailUsernames extends Migration
{
	/**
	 * Run the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		$users = $this->fetch(
			"SELECT id, first_name, last_name FROM users WHERE username LIKE '%@%'"
		);

		if (empty($users))
		{
			return;
		}

		foreach ($users as $user)
		{
			$base = strtolower(trim(($user->first_name ?? '') . '_' . ($user->last_name ?? '')));
			$base = preg_replace('/[^a-z0-9_]/', '', $base);
			$base = trim($base, '_') ?: 'user';

			$handle = $base;
			$attempts = 0;
			while ($this->first("SELECT id FROM users WHERE username = ? AND id != ?", [$handle, $user->id]))
			{
				$handle = $base . '_' . rand(100, 9999);
				if (++$attempts > 20)
				{
					$handle = $base . '_' . uniqid();
					break;
				}
			}

			$this->execute("UPDATE users SET username = ? WHERE id = ?", [$handle, $user->id]);
		}
	}

	/**
	 * Reverse the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		// Intentionally empty — there is no safe way to restore original email usernames.
	}
}
