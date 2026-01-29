<?php declare(strict_types=1);
namespace Modules\Client\Contact\Gateway;

use Modules\Client\Contact\Models\ClientContact;

/**
 * Gateway
 *
 * @package Modules\Client\Contact\Gateway
 */
class Gateway
{
	/**
	 * Get a contact by ID.
	 *
	 * @param mixed $id
	 * @return ClientContact|null
	 */
	public function get(mixed $id): ?ClientContact
	{
		return ClientContact::get($id);
	}

	/**
	 * Create a new contact.
	 *
	 * @param object $data
	 * @return ClientContact
	 */
	public function create(object $data): ClientContact
	{
		$contact = new ClientContact($data);
		$contact->add();
		return $contact;
	}

	/**
	 * Update a contact.
	 *
	 * @param object $data
	 * @return bool
	 */
	public function update(object $data): bool
	{
		$contact = new ClientContact($data);
		return $contact->update();
	}

	/**
	 * Delete a contact.
	 *
	 * @param mixed $id
	 * @return bool
	 */
	public function delete(mixed $id): bool
	{
		return ClientContact::remove($id);
	}
}
