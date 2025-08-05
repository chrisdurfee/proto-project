<?php declare(strict_types=1);
namespace Modules\Auth\Storage;

use Proto\Storage\Storage;

/**
 * LoginAttemptUsernameStorage
 *
 * This will handle the login attempt username storage.
 *
 * @package Modules\Auth\Storage
 */
class LoginAttemptUsernameStorage extends Storage
{
    /**
	 * This will check if the table aready has the model data.
	 *
	 * @param object $data
	 * @return bool
	 */
	protected function exists(object $data): bool
	{
		$rows = $this->select('id')
			->where("{$this->alias}.username = ?")
			->limit(1)
			->fetch([$data->username]);

		return $this->checkExistCount($rows);
	}
}