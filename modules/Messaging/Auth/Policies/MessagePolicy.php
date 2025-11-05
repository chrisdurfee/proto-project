<?php declare(strict_types=1);
namespace Modules\Messaging\Auth\Policies;

use Proto\Auth\Policies\Policy;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * MessagePolicy
 *
 * @package Modules\Messaging\Auth\Policies
 */
class MessagePolicy extends Policy
{
	/**
	 * Check if the user is a participant of the conversation.
	 *
	 * @param int $conversationId
	 * @return bool
	 */
	protected function isParticipant(int $conversationId): bool
	{
		$userId = session()->user->id ?? null;
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
	 * Check if the user owns the message.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	protected function ownsMessage(int $messageId): bool
	{
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return false;
		}

		$message = Message::get($messageId);
		if (!$message)
		{
			return false;
		}

		return (int)$message->senderId === $userId;
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

		return $this->isParticipant($conversationId);
	}

	/**
	 * Determines if the user can get all messages (list).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function getAll(Request $request): bool
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return false;
		}

		return $this->isParticipant($conversationId);
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

		return $this->isParticipant($conversationId);
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

		return $this->isParticipant($conversationId);
	}
}