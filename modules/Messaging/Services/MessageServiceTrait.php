<?php declare(strict_types=1);
namespace Modules\Messaging\Services;

use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\ConversationParticipant;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Push\NewMessage;
use Modules\Notification\Models\UserNotification;

/**
 * MessageServiceTrait
 *
 * Shared functionality for message-related services.
 *
 * @package Modules\Messaging\Services
 */
trait MessageServiceTrait
{
	/**
	 * Update the conversation's last message reference.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @return void
	 */
	protected function updateConversationLastMessage(int $conversationId, int $messageId): void
	{
		$message = Message::get($messageId);
		if ($message)
		{
			Conversation::updateLastMessage(
				$conversationId,
				$messageId,
				$message->content,
				$message->type ?? 'text'
			);
		}
		else
		{
			Conversation::edit((object)[
				'id' => $conversationId,
				'lastMessageId' => $messageId,
				'lastMessageAt' => date('Y-m-d H:i:s')
			]);
		}
	}

	/**
	 * Publish Redis event for real-time message delivery.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @param string $action
	 * @return void
	 */
	protected function publishRedisEvent(int $conversationId, int $messageId, string $action = 'merge'): void
	{
		events()->emit("redis:conversation:{$conversationId}:messages", [
			'id' => $messageId,
			'action' => $action
		]);
	}

	/**
	 * Notify all conversation participants about an update.
	 *
	 * @param int $conversationId
	 * @param int $messageId
	 * @param bool $sendPushNotifications
	 * @return void
	 */
	protected function notifyConversationParticipants(
		int $conversationId,
		int $messageId,
		bool $sendPushNotifications = false
	): void
	{
		$participants = ConversationParticipant::fetchWhere([
			['cp.conversationId', $conversationId]
		]);

		if (empty($participants))
		{
			return;
		}

		$message = Message::get($messageId);
		if (!$message)
		{
			return;
		}

		foreach ($participants as $participant)
		{
			events()->emit("redis:user:{$participant->userId}:conversations", [
				'id' => $conversationId,
				'conversationId' => $conversationId,
				'action' => 'merge'
			]);

			if ($sendPushNotifications && (int)$participant->userId !== (int)$message->senderId)
			{
				$this->sendPushNotification($participant->userId, $message);
				$this->logMessageNotification((int)$participant->userId, $message);
			}
		}
	}

	/**
	 * Send push notification for a new message.
	 *
	 * @param int $userId
	 * @param Message $message
	 * @return void
	 */
	protected function sendPushNotification(int $userId, Message $message): void
	{
		$settings = (object)[
			'template' => NewMessage::class,
			'queue' => false
		];

		$data = (object)[
			'displayName' => $message->displayName,
			'conversationId' => $message->conversationId,
			'messageId' => $message->id,
			'message' => $message->content
		];

		modules()->user()->push()->send($userId, $settings, $data);
	}

	/**
	 * Log an in-app notification for a new message.
	 *
	 * If an unread notification already exists for the same conversation,
	 * update it instead of creating a duplicate. This prevents notification
	 * spam when the same user sends multiple messages in a row.
	 *
	 * @param int $userId
	 * @param Message $message
	 * @return void
	 */
	protected function logMessageNotification(int $userId, Message $message): void
	{
		$name = $message->displayName ?? 'Someone';
		$conversationId = (int)$message->conversationId;

		$existing = UserNotification::builder()
			->select()
			->where(
				'un.user_id = ?',
				'un.ref_id = ?',
				"un.ref_type = 'conversation'",
				'un.is_read = 0',
				'un.deleted_at IS NULL'
			)
			->first([$userId, $conversationId]);

		if ($existing)
		{
			UserNotification::builder()
				->update()
				->set([
					'description' => "{$name} sent you a message",
					'created_at' => date('Y-m-d H:i:s'),
					'updated_at' => date('Y-m-d H:i:s')
				])
				->where('id = ?')
				->execute([(int)$existing->id]);

			$this->broadcastNotificationUpdate($userId);
			return;
		}

		modules()->notification()->log(
			$userId,
			'social',
			'social',
			'medium',
			'New Message',
			"{$name} sent you a message",
			'chat',
			[
				'refId' => $conversationId,
				'refType' => 'conversation'
			]
		);
	}

	/**
	 * Broadcast a notification update so the activity center refreshes.
	 *
	 * @param int $userId
	 * @return void
	 */
	protected function broadcastNotificationUpdate(int $userId): void
	{
		events()->emit("redis:notification:user:{$userId}", [
			'refresh' => true
		]);
	}

	/**
	 * Touch conversation timestamp.
	 *
	 * @param int $conversationId
	 * @return void
	 */
	protected function touchConversation(int $conversationId): void
	{
		Conversation::edit((object)['id' => $conversationId]);
	}
}
