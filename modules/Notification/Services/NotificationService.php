<?php declare(strict_types=1);

namespace Modules\Notification\Services;

use Common\Services\Service;
use Modules\Notification\Models\UserNotification;
use Proto\Events\Events;

/**
 * NotificationService
 *
 * Handles business logic for creating, reading, and dismissing notifications.
 *
 * @package Modules\Notification\Services
 */
class NotificationService extends Service
{
	/**
	 * Create and persist a new notification for a user, then broadcast via Redis
	 * so connected SSE clients receive it in real time.
	 *
	 * @param int $userId
	 * @param string $type Notification type (e.g. 'social', 'garage').
	 * @param string $category Display category (e.g. 'social', 'maintenance').
	 * @param string $priority 'high' | 'medium' | 'low'
	 * @param string $title
	 * @param string $description
	 * @param string $iconName Material Symbol name.
	 * @param array  $options Optional keys: primaryAction, secondaryAction,
	 *                           statusBadge, metadata, refId, refType.
	 * @return UserNotification|null
	 */
	public function log(
		int $userId,
		string $type,
		string $category,
		string $priority,
		string $title,
		string $description,
		string $iconName,
		array $options = []
	): ?UserNotification
	{
		$notification = $this->createNotification($userId, $type, $category, $priority, $title, $description, $iconName, $options);
		if (!$notification)
		{
			return null;
		}

		$this->broadcastNewNotification($userId, $notification);
		return $notification;
	}

	/**
	 * Mark a single notification as read.
	 *
	 * @param int $id
	 * @param int $userId
	 * @return bool
	 */
	public function markRead(int $id, int $userId): bool
	{
		$notification = $this->getOwnedNotification($id, $userId);
		if (!$notification)
		{
			return false;
		}

		$notification->isRead = 1;
		$notification->readAt = date('Y-m-d H:i:s');
		return (bool)$notification->update();
	}

	/**
	 * Mark all notifications as read for a user.
	 *
	 * @param int $userId
	 * @return bool
	 */
	public function markAllRead(int $userId): bool
	{
		return UserNotification::markAllReadForUser($userId);
	}

	/**
	 * Soft-delete (dismiss) a notification.
	 *
	 * @param int $id
	 * @param int $userId
	 * @return bool
	 */
	public function dismiss(int $id, int $userId): bool
	{
		$notification = $this->getOwnedNotification($id, $userId);
		if (!$notification)
		{
			return false;
		}

		if (!(int)$notification->isRead)
		{
			$notification->isRead = 1;
			$notification->readAt = date('Y-m-d H:i:s');
			$notification->update();
		}

		return (bool)$notification->delete();
	}

	/**
	 * Build and persist the notification record.
	 *
	 * @param int $userId
	 * @param string $type
	 * @param string $category
	 * @param string $priority
	 * @param string $title
	 * @param string $description
	 * @param string $iconName
	 * @param array $options
	 * @return UserNotification|null
	 */
	protected function createNotification(
		int $userId,
		string $type,
		string $category,
		string $priority,
		string $title,
		string $description,
		string $iconName,
		array $options
	): ?UserNotification
	{
		$defaults = [
			'userId' => $userId,
			'type' => $type,
			'category' => $category,
			'priority' => $priority,
			'title' => $title,
			'description' => $description,
			'iconName' => $iconName,
			'isRead' => 0
		];

		$optionalFields = ['primaryAction', 'secondaryAction', 'statusBadge', 'metadata', 'refId', 'refType', 'createdAt'];
		foreach ($optionalFields as $field)
		{
			if (isset($options[$field]))
			{
				$defaults[$field] = $options[$field];
			}
		}

		$data = $defaults;

		$jsonFields = ['statusBadge', 'metadata'];
		foreach ($jsonFields as $field)
		{
			if (isset($data[$field]) && is_array($data[$field]))
			{
				$data[$field] = json_encode($data[$field]);
			}
		}

		$notification = new UserNotification((object)$data);
		$notification->add();

		return $notification->id ? $notification : null;
	}

	/**
	 * Publish a Redis event so active SSE clients receive the new notification.
	 *
	 * @param int $userId
	 * @param UserNotification $notification
	 * @return void
	 */
	protected function broadcastNewNotification(int $userId, UserNotification $notification): void
	{
		Events::update("redis:notification:user:{$userId}", [
			'merge' => [$notification]
		]);
	}

	/**
	 * Fetch a notification and verify it belongs to the given user.
	 *
	 * @param int $id
	 * @param int $userId
	 * @return UserNotification|null
	 */
	protected function getOwnedNotification(int $id, int $userId): ?UserNotification
	{
		$notification = UserNotification::get($id);
		if (!$notification || (int)$notification->userId !== $userId)
		{
			return null;
		}

		return $notification;
	}

	/**
	 * Get recent unread notifications formatted as feed assistant cards.
	 *
	 * @param int $userId
	 * @param int $limit
	 * @return array
	 */
	public function getFeedCards(int $userId, int $limit = 10): array
	{
		return UserNotification::getFeedCards($userId, $limit);
	}
}
