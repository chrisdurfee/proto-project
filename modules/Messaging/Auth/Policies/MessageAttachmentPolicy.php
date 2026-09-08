<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Http\Router\Request;
use Modules\Messaging\Models\MessageAttachment;

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
	 * The attachment row must belong to the route message so a participant
	 * of one conversation cannot read attachments from another.
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

		if (!$this->isParticipantOfMessageConversation($messageId))
		{
			return false;
		}

		$attachmentId = $this->getResourceId($request);
		if ($attachmentId)
		{
			$attachment = MessageAttachment::get((int)$attachmentId);
			if (!$attachment || (int)$attachment->messageId !== $messageId)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Determines if the user can update an attachment (also covers PUT via
	 * the base policy's setup() delegation).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
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
