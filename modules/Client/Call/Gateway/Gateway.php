<?php declare(strict_types=1);
namespace Modules\Client\Call\Gateway;

use Modules\Client\Call\Models\ClientCall;

/**
 * Gateway
 *
 * @package Modules\Client\Call\Gateway
 */
class Gateway
{
	/**
	 * Get a call by ID.
	 *
	 * @param mixed $id
	 * @return ClientCall|null
	 */
	public function get(mixed $id): ?ClientCall
	{
		return ClientCall::get($id);
	}

	/**
	 * Create a new call.
	 *
	 * @param object $data
	 * @return ClientCall
	 */
	public function create(object $data): ClientCall
	{
		$call = new ClientCall($data);
		$call->add();
		return $call;
	}

	/**
	 * Update a call.
	 *
	 * @param object $data
	 * @return bool
	 */
	public function update(object $data): bool
	{
		$call = new ClientCall($data);
		return $call->update();
	}

	/**
	 * Delete a call.
	 *
	 * @param mixed $id
	 * @return bool
	 */
	public function delete(mixed $id): bool
	{
		return ClientCall::remove($id);
	}
}
