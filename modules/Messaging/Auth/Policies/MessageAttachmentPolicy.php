<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Http\Router\Request;

/**
 * MessageAttachmentPolicy
 *
 * Ensures only conversation participants can manage message attachments.
 *
 * @package Modules\Messaging\Auth\Policies
 */
class MessageAttachmentPolicy extends MessagingPolicy
{
	/**
	 * Determines if the user can view a single attachment.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? 0);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}

	/**
	 * Determines if the user can list all attachments for a message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? 0);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}

	/**
	 * Determines if the user can add an attachment to a message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? 0);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}

	/**
	 * Determines if the user can delete an attachment.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		$messageId = (int)($request->params()->messageId ?? 0);
		if (!$messageId)
		{
			return false;
		}

		return $this->isParticipantOfMessageConversation($messageId);
	}
}
