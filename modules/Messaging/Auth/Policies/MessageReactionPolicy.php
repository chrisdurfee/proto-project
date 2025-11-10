<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Http\Router\Request;

/**
 * MessageReactionPolicy
 *
 * @package Modules\Messaging\Auth\Policies
 */
class MessageReactionPolicy extends MessagingPolicy
{
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
