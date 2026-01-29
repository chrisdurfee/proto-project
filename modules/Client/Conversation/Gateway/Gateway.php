<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Gateway;

use Modules\Client\Conversation\Models\ClientConversation;

/**
 * Gateway
 *
 * @package Modules\Client\Conversation\Gateway
 */
class Gateway
{
	/**
	 * Get a conversation by ID.
	 *
	 * @param mixed $id
	 * @return ClientConversation|null
	 */
	public function get(mixed $id): ?ClientConversation
	{
		return ClientConversation::get($id);
	}

	/**
	 * Create a new conversation.
	 *
	 * @param object $data
	 * @return ClientConversation
	 */
	public function create(object $data): ClientConversation
	{
		$conversation = new ClientConversation($data);
		$conversation->add();
		return $conversation;
	}

	/**
	 * Update a conversation.
	 *
	 * @param object $data
	 * @return bool
	 */
	public function update(object $data): bool
	{
		$conversation = new ClientConversation($data);
		return $conversation->update();
	}

	/**
	 * Delete a conversation.
	 *
	 * @param mixed $id
	 * @return bool
	 */
	public function delete(mixed $id): bool
	{
		return ClientConversation::remove($id);
	}
}
