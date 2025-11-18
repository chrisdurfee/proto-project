<?php declare(strict_types=1);
namespace Modules\Assistant\Auth\Policies;

use Proto\Http\Router\Request;
use Modules\Assistant\Models\AssistantMessage;

/**
 * AssistantMessagePolicy
 *
 * @package Modules\Assistant\Auth\Policies
 */
class AssistantMessagePolicy extends AssistantPolicy
{
	/**
	 * Check if the user owns the message.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	protected function ownsMessage(int $messageId): bool
	{
		$userId = $this->getUserId();
		if (!$userId)
		{
			return false;
		}

		$message = AssistantMessage::get($messageId);
		if (!$message)
		{
			return false;
		}

		return (int)$message->userId === $userId;
	}

	/**
	 * Determines if the user can view messages in a conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can get all messages (list).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can add a new message to the conversation.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can update a message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
	{
		$messageId = $this->getResourceId($request);
		if (!$messageId)
		{
			return false;
		}

		return $this->ownsMessage($messageId);
	}

	/**
	 * Determines if the user can delete a message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		$messageId = $this->getResourceId($request);
		if (!$messageId)
		{
			return false;
		}

		return $this->ownsMessage($messageId);
	}

	/**
	 * Determines if the user can sync messages.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function sync(Request $request): bool
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}

	/**
	 * Determines if the user can generate AI responses.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function generate(Request $request): bool
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return false;
		}

		return $this->ownsConversation($conversationId);
	}
}
