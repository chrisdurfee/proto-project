<?php declare(strict_types=1);
namespace Modules\Client\Gateway;

use Modules\Client\Main\Models\Client;
use Modules\Client\Contact\Gateway\Gateway as ContactGateway;
use Modules\Client\Call\Gateway\Gateway as CallGateway;
use Modules\Client\Note\Gateway\Gateway as NoteGateway;
use Modules\Client\Conversation\Gateway\Gateway as ConversationGateway;

/**
 * Gateway
 *
 * @package Modules\Client\Gateway
 */
class Gateway
{
	/**
	 * Get a client by ID.
	 *
	 * @param mixed $id
	 * @return Client|null
	 */
	public function get(mixed $id): ?Client
	{
		return Client::get($id);
	}

	/**
	 * Create a new client.
	 *
	 * @param object $data
	 * @return Client
	 */
	public function create(object $data): Client
	{
		$client = new Client($data);
		$client->add();
		return $client;
	}

	/**
	 * Update a client.
	 *
	 * @param object $data
	 * @return bool
	 */
	public function update(object $data): bool
	{
		$client = new Client($data);
		return $client->update();
	}

	/**
	 * Delete a client.
	 *
	 * @param mixed $id
	 * @return bool
	 */
	public function delete(mixed $id): bool
	{
		return Client::remove($id);
	}

	/**
	 * Access the Contact feature.
	 *
	 * @return ContactGateway
	 */
	public function contact(): ContactGateway
	{
		return new ContactGateway();
	}

	/**
	 * Access the Call feature.
	 *
	 * @return CallGateway
	 */
	public function call(): CallGateway
	{
		return new CallGateway();
	}

	/**
	 * Access the Note feature.
	 *
	 * @return NoteGateway
	 */
	public function note(): NoteGateway
	{
		return new NoteGateway();
	}

	/**
	 * Access the Conversation feature.
	 *
	 * @return ConversationGateway
	 */
	public function conversation(): ConversationGateway
	{
		return new ConversationGateway();
	}
}
