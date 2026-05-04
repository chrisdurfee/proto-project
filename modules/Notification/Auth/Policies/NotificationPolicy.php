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
	 * Allow any authenticated user through by default
	 * (list, mark-all-read, sync).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function before(Request $request): bool
	{
		return $this->isSignedIn();
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
