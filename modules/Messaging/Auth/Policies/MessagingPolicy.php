<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Auth\Policies\Policy;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\ConversationParticipant;
use Modules\Messaging\Models\Message;

/**
 * MessagingPolicy
 *
 * Abstract base policy for messaging-related authorization.
 * Provides shared methods for conversation participation and user validation.
 *
 * @package Modules\Messaging\Auth\Policies
 */
abstract class MessagingPolicy extends Policy
{
	/**
	 * Get the current authenticated user ID.
	 *
	 * @return int|null
	 */
	protected function getUserId(): ?int
	{
		return session()->user->id ?? null;
	}

	/**
	 * Check if the user is a participant of the conversation.
	 *
	 * @param int $conversationId
	 * @return bool
	 */
	protected function isParticipant(int $conversationId): bool
	{
		$userId = $this->getUserId();
		if (!$userId)
		{
			return false;
		}

		$participant = ConversationParticipant::getBy([
			'conversation_id' => $conversationId,
			'user_id' => $userId
		]);

		return $participant !== null;
	}

	/**
	 * Verify that the userId in the request matches the authenticated user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	protected function matchesAuthenticatedUser(Request $request): bool
	{
		$userId = (int)($request->params()->userId ?? null);
		$sessionUserId = $this->getUserId();

		if (!$userId || !$sessionUserId)
		{
			return false;
		}

		return $userId === $sessionUserId;
	}

	/**
	 * Check if the user is a participant of the conversation that the message belongs to.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	protected function isParticipantOfMessageConversation(int $messageId): bool
	{
		$userId = $this->getUserId();
		if (!$userId)
		{
			return false;
		}

		// Get the message to find its conversation
		$message = Message::get($messageId);
		if (!$message)
		{
			return false;
		}

		// Check if user is a participant of that conversation
		return $this->isParticipant($message->conversationId);
	}
}
