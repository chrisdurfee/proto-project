<?php declare(strict_types=1);
namespace Modules\Assistant\Auth\Policies;

use Common\Auth\Policies\Policy;
use Modules\Assistant\Models\AssistantConversation;

/**
 * AssistantConversationPolicy
 *
 * @package Modules\Assistant\Auth\Policies
 */
class AssistantConversationPolicy extends Policy
{
	/**
	 * Default policy for all actions.
	 *
	 * @return bool
	 */
	public function default(): bool
	{
		return $this->user()->isAuthenticated();
	}

	/**
	 * Policy for getting a conversation.
	 *
	 * @param int $conversationId
	 * @return bool
	 */
	public function get(int $conversationId): bool
	{
		if (!$this->user()->isAuthenticated())
		{
			return false;
		}

		// Users can only access their own conversations
		$conversation = AssistantConversation::get($conversationId);
		if (!$conversation)
		{
			return false;
		}

		return (int)$conversation->userId === (int)$this->user()->id();
	}

	/**
	 * Policy for listing conversations.
	 *
	 * @return bool
	 */
	public function list(): bool
	{
		return $this->user()->isAuthenticated();
	}

	/**
	 * Policy for creating a conversation.
	 *
	 * @return bool
	 */
	public function add(): bool
	{
		return $this->user()->isAuthenticated();
	}

	/**
	 * Policy for deleting a conversation.
	 *
	 * @param int $conversationId
	 * @return bool
	 */
	public function delete(int $conversationId): bool
	{
		if (!$this->user()->isAuthenticated())
		{
			return false;
		}

		$conversation = AssistantConversation::get($conversationId);
		if (!$conversation)
		{
			return false;
		}

		return (int)$conversation->userId === (int)$this->user()->id();
	}
}
