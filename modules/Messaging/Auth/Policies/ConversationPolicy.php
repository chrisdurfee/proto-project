<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Http\Router\Request;
use Modules\Messaging\Models\Conversation;

/**
 * ConversationPolicy
 *
 * @package Modules\Messaging\Auth\Policies
 */
class ConversationPolicy extends MessagingPolicy
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

		$conversation = Conversation::get($conversationId);
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

		return $this->isParticipant($conversationId);
	}

	/**
	 * Determines if the user can get all conversations (list).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		// User can only list their own conversations (filtered by userId in route)
		return $this->matchesAuthenticatedUser($request);
	}

	/**
	 * Determines if the user can add a new conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		// Authenticated users can create conversations
		return $this->getUserId() !== null;
	}

	/**
	 * Determines if the user can setup a conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function setup(Request $request): bool
	{
		return $this->getUserId() !== null;
	}

	/**
	 * Determines if the user can find or create a conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function findOrCreate(Request $request): bool
	{
		// User can only find or create conversations for themselves
		return $this->matchesAuthenticatedUser($request);
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

		// Only the conversation owner can update it
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

		// Only the conversation owner can delete it
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
		// User can only sync their own conversations (filtered by userId in route)
		return $this->matchesAuthenticatedUser($request);
	}
}
