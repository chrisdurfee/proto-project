<?php declare(strict_types=1);

namespace Modules\User\Push\Gateway;

use Modules\User\Push\Storage\WebPushUserStorage;
use Modules\User\Push\Controllers\WebPushUserController;

/**
 * Push Gateway
 *
 * @package Modules\User\Push\Gateway
 */
class Gateway
{
	/**
	 * Constructor
     *
     * @param WebPushUserController|null $controller The controller to handle web push notifications.
	 */
	public function __construct(
        protected WebPushUserController $controller = new WebPushUserController()
    )
	{
	}

	/**
	 * Sends a web push notification to the user.
	 *
	 * @param mixed $userId The user ID to send the notification to.
	 * @param object $settings The settings for the notification.
	 * @param object|null $data Optional data for the notification.
	 * @return object|null The response from the dispatcher or null if user ID is not set.
	 */
	public function send(mixed $userId, object $settings, ?object $data = null): ?object
	{
		return $this->controller->send($userId, $settings, $data);
	}
}
