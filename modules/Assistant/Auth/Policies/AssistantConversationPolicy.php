<?php declare(strict_types=1);
namespace Modules\Assistant\Auth\Policies;

use Proto\Http\Router\Request;
use Modules\Assistant\Models\AssistantConversation;

/**
 * AssistantConversationPolicy
 *
 * @package Modules\Assistant\Auth\Policies
 */
class AssistantConversationPolicy extends AssistantPolicy
{
	/**
	 * Check if the user owns the conversation.
	 *
	 * @param int $conversationId
	 * @return bool
	 */
	protected function ownsConversation(int $conversationId): bool
	{
		$userId = $this->getUserId();
		if (!$userId)
		{
			return false;
		}

		$conversation = AssistantConversation::get($conversationId);
		if (!$conversation)
		{
			return false;
		}

		return (int)$conversation->userId === $userId;
	}

	/**
	 * Determines if the user can view a specific conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		$conversationId = $this->getResourceId($request);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can get all conversations (list).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		return $this->getUserId() !== null;
	}

	/**
	 * Determines if the user can add a new conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		return $this->getUserId() !== null;
	}

	/**
	 * Determines if the user can get the active conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function getActive(Request $request): bool
	{
		return $this->getUserId() !== null;
	}

	/**
	 * Determines if the user can update a conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
	{
		$conversationId = $this->getResourceId($request);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can delete a conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		$conversationId = $this->getResourceId($request);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can sync conversations.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function sync(Request $request): bool
	{
		return $this->getUserId() !== null;
	}
}
