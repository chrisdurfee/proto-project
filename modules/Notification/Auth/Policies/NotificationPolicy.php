<?php declare(strict_types=1);

namespace Modules\Notification\Auth\Policies;

use Common\Auth\Policies\Policy;
use Modules\Notification\Models\UserNotification;
use Proto\Http\Router\Request;

/**
 * NotificationPolicy
 *
 * Controls access to the notification endpoints.
 * Any authenticated user may manage their own notifications.
 *
 * @package Modules\Notification\Auth\Policies
 */
class NotificationPolicy extends Policy
{
	/**
	 * @var string|null $type The policy type identifier.
	 */
	protected ?string $type = 'notification';

	/**
	 * Admin bypass; per-method gates handle non-admin access.
	 *
	 * A `before()` that returns true short-circuits every other policy
	 * method, so it must never return a bare `isSignedIn()` here or the
	 * ownership checks below would never run.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function before(Request $request): bool
	{
		return $this->isAdmin();
	}

	/**
	 * Listing notifications is scoped server-side to the session user;
	 * any authenticated user may list their own.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Allow fetching the unread notification count.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function unreadCount(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Allow fetching feed-card notifications for the session user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function feedCards(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Allow syncing notifications.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function sync(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Allow marking all of the session user's notifications as read.
	 * Server-side scope ensures only the caller's notifications are touched.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function markAllRead(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Allow marking a single notification read only if it belongs to the user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function markRead(Request $request): bool
	{
		return $this->ownsNotification($request);
	}

	/**
	 * Allow dismissing a single notification only if it belongs to the user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function dismiss(Request $request): bool
	{
		return $this->ownsNotification($request);
	}

	/**
	 * Allow fetching a single notification only if it belongs to the user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		return $this->ownsNotification($request);
	}

	/**
	 * Allow updating (mark read) only if the notification belongs to the user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
	{
		return $this->ownsNotification($request);
	}

	/**
	 * Allow deleting (dismiss) only if the notification belongs to the user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		return $this->ownsNotification($request);
	}

	/**
	 * Check whether the authenticated user owns the requested notification.
	 *
	 * @param Request $request
	 * @return bool
	 */
	protected function ownsNotification(Request $request): bool
	{
		$id = $this->getResourceId($request);
		if (!$id)
		{
			return false;
		}

		$notification = UserNotification::get($id);
		if (!$notification)
		{
			return false;
		}

		$userId = $this->getUserId();
		return (int)$notification->userId === $userId;
	}
}
