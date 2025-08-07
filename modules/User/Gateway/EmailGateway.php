<?php declare(strict_types=1);
namespace Modules\User\Gateway;

use Modules\User\Models\User;
use Proto\Dispatch\Dispatcher;

/**
 * EmailGateway
 *
 * This will handle the user module email gateway.
 *
 * @package Modules\User\Gateway
 */
class EmailGateway
{
	/**
	 * This will set up the controller.
	 *
	 * @param string $model
	 */
	public function __construct(
		protected string $model = User::class
	)
	{
	}

    /**
	 * Sends an email to the user by id.
	 *
	 * @param mixed $userId The user ID to send the notification to.
	 * @param object $settings The settings for the notification.
	 * @param object|null $data Optional data for the notification.
	 * @return object|null The response from the dispatcher or null if user ID is not set.
	 */
	public function sendById(mixed $userId, object $settings, ?object $data = null): ?object
	{
        $user = User::get($userId);
        if (!$user)
        {
            return null;
        }

        return static::send($user, $settings, $data);
	}

	/**
	 * Sends an email to the user.
	 *
	 * @param object $user The user to send the notification to.
	 * @param object $settings The settings for the notification.
	 * @param object|null $data Optional data for the notification.
	 * @return object|null The response from the dispatcher or null if user is not set.
	 */
	public function send(object $user, object $settings, ?object $data = null): ?object
	{
        if (!$user)
        {
            return null;
        }

        if (((bool)($user->allowEmail ?? true)) == false)
        {
            return null;
        }

        if (empty($settings->to) && !empty($user->email))
        {
            $settings->to = $user->email;
        }

		return Dispatcher::email($settings, $data);
	}
}