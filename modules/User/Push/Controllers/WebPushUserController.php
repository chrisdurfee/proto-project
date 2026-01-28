<?php declare(strict_types=1);

namespace Modules\User\Push\Controllers;

use Modules\User\Main\Models\NotificationPreference;
use Modules\User\Push\Models\WebPushUser;
use Proto\Controllers\ResourceController as Controller;
use Proto\Dispatch\Dispatcher;

/**
 * WebPushUserController
 *
 * This controller handles web push notifications for users.
 *
 * @package Modules\User\Push\Controllers
 */
class WebPushUserController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = WebPushUser::class)
	{
		parent::__construct();
	}

	/**
	 * This will check if the user can receive push notifications.
	 *
	 * @param mixed $userId
	 * @param string $preferenceClass
	 * @return bool
	 */
	protected function canPush(
		mixed $userId,
		string $preferenceClass = NotificationPreference::class
	): bool
	{
		$preference = $preferenceClass::getBy([
			['user_id', $userId]
		]);
		return (bool)($preference?->allowPush ?? true);
	}

	/**
	 * This will format the subscriptions for the dispatcher.
	 *
	 * @param array $subscriptions
	 * @return array
	 */
	protected function formatSubscriptions(array $subscriptions): array
	{
		$pushSubscriptions = [];
		foreach ($subscriptions as $subscription)
		{
			array_push($pushSubscriptions, [
				'id' => $subscription->id,
				'endpoint' => $subscription->endpoint,
				'keys' => [
					'auth' => $subscription->authKeys->auth ?? '',
					'p256dh' => $subscription->authKeys->p256dh ?? ''
				]
			]);
		}
		return $pushSubscriptions;
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
		if (!isset($userId))
		{
			return null;
		}

		if (!$this->canPush($userId))
		{
			return null;
		}

		$model = $this->model();
		$subscriptions = $model->getByUser($userId);
		if (!isset($subscriptions))
		{
			return null;
		}

		$settings->subscriptions = $this->formatSubscriptions($subscriptions);
		return Dispatcher::push($settings, $data);
	}
}
