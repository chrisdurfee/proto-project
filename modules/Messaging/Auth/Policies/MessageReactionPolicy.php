<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Auth\Policies\Policy;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * MessageReactionPolicy
 *
 * @package Modules\Messaging\Auth\Policies
 */
class MessageReactionPolicy extends Policy
{
	/**
	 * Check if the user is a participant of the conversation that the message belongs to.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	protected function isParticipantOfMessageConversation(int $messageId): bool
	{
		$userId = session()->user->id ?? null;
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
		$participant = ConversationParticipant::getBy([
			'conversation_id' => $message->conversationId,
			'user_id' => $userId
		]);

		return $participant !== null;
	}

	/**
	 * Determines if the user can toggle a reaction on a message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function toggle(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? null);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}

	/**
	 * Determines if the user can view all reactions for a message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? null);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}

	/**
	 * Determines if the user can delete a reaction.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? null);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}
}
