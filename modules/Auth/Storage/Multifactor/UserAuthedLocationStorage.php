<?php declare(strict_types=1);
namespace Modules\Auth\Storage\Multifactor;

use Proto\Storage\Storage;

/**
 * UserAuthedLocationStorage
 *
 * Handles persistence for authenticated user locations.
 *
 * @package Modules\Auth\Storage\Multifactor
 */
class UserAuthedLocationStorage extends Storage
{
	/**
	 * Verifies that the location already exists for the user.
	 *
	 * @param object $data
	 * @return bool
	 */
	protected function exists(object $data): bool
	{
		$rows = $this->select('id')
			->where(
				"{$this->alias}.region_code = ?",
				"{$this->alias}.country_code = ?",
				"{$this->alias}.postal = ?"
			)
			->limit(1)
			->fetch([$data->region_code, $data->country_code, $data->postal]);

		return $this->checkExistCount($rows);
	}
}
