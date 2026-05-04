<?php declare(strict_types=1);

namespace Modules\Notification\Gateway;

use Modules\Notification\Models\UserNotification;
use Modules\Notification\Services\NotificationService;

/**
 * Gateway
 *
 * Public interface for the Notification module.
 * Other modules call: modules()->notification()->log(...)
 *
 * @package Modules\Notification\Gateway
 */
class Gateway
{
	/**
	 * @var NotificationService|null $service
	 */
	protected ?NotificationService $service = null;

	/**
	 * Create and log a new notification for a user.
	 *
	 * @param int $userId
	 * @param string $type e.g. 'social', 'garage', 'market'
	 * @param string $category e.g. 'social', 'maintenance', 'offers'
	 * @param string $priority 'high' | 'medium' | 'low'
	 * @param string $title
	 * @param string $description
	 * @param string $iconName Material Symbol name
	 * @param array  $options Optional: primaryAction, secondaryAction,
	 * statusBadge, metadata, refId, refType
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
		return $this->service()->log($userId, $type, $category, $priority, $title, $description, $iconName, $options);
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
		return $this->service()->markRead($id, $userId);
	}

	/**
	 * Mark all notifications as read for a user.
	 *
	 * @param int $userId
	 * @return bool
	 */
	public function markAllRead(int $userId): bool
	{
		return $this->service()->markAllRead($userId);
	}

	/**
	 * Dismiss (soft-delete) a notification.
	 *
	 * @param int $id
	 * @param int $userId
	 * @return bool
	 */
	public function dismiss(int $id, int $userId): bool
	{
		return $this->service()->dismiss($id, $userId);
	}

	/**
	 * Get the unread notification count for a user.
	 *
	 * @param int $userId
	 * @return int
	 */
	public function getUnreadCount(int $userId): int
	{
		return UserNotification::getUnreadCount($userId);
	}

	/**
	 * Fetch a paginated list of notifications for a user.
	 *
	 * @param int $userId
	 * @param string|null $category
	 * @param int $offset
	 * @param int $limit
	 * @return array
	 */
	public function all(int $userId, ?string $category = null, int $offset = 0, int $limit = 20): array
	{
		return UserNotification::getForUser($userId, $category, $offset, $limit);
	}

	/**
	 * Get recent unread notifications for home feed assistant cards.
	 *
	 * @param int $userId
	 * @param int $limit
	 * @return array
	 */
	public function feedCards(int $userId, int $limit = 10): array
	{
		return $this->service()->getFeedCards($userId, $limit);
	}

	/**
	 * Lazily instantiate the service.
	 *
	 * @return NotificationService
	 */
	protected function service(): NotificationService
	{
		$this->service ??= new NotificationService();
		return $this->service;
	}
}
