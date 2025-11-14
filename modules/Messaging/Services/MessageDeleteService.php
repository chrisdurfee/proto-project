<?php declare(strict_types=1);
namespace Modules\Messaging\Services;

use Common\Services\Service;
use Modules\Messaging\Models\Message;

/**
 * MessageDeleteService
 *
 * This service handles message deletion operations.
 *
 * @package Modules\Messaging\Services
 */
class MessageDeleteService extends Service
{
	use MessageServiceTrait;

	/**
	 * Delete (soft delete) a message.
	 *
	 * @param int $messageId
	 * @param int|null $conversationId
	 * @return object
	 */
	public function deleteMessage(int $messageId, ?int $conversationId = null): object
	{
		if (!$messageId)
		{
			return $this->error('Message ID required');
		}

		$success = Message::remove((object)[
			'id' => $messageId
		]);

		if (!$success)
		{
			return $this->error('Failed to delete message');
		}

		// If conversation ID is provided, publish events and notify participants
		if ($conversationId)
		{
			$this->publishRedisEvent($conversationId, $messageId, 'delete');
			$this->notifyConversationParticipants($conversationId, $messageId);
		}

		return $this->response([
			'success' => true,
			'messageId' => $messageId
		]);
	}
}
