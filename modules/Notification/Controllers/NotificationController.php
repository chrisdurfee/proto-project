<?php declare(strict_types=1);

namespace Modules\Notification\Controllers;

use Modules\Notification\Auth\Policies\NotificationPolicy;
use Modules\Notification\Models\UserNotification;
use Modules\Notification\Services\NotificationService;
use Proto\Controllers\ResourceController;
use Proto\Controllers\Traits\SyncableTrait;
use Proto\Http\Router\Request;

/**
 * NotificationController
 *
 * Handles CRUD, mark-all-read, and SSE sync for user notifications.
 *
 * @package Modules\Notification\Controllers
 */
class NotificationController extends ResourceController
{
	use SyncableTrait;

	/**
	 * @var string|null $policy The policy class.
	 */
	protected ?string $policy = NotificationPolicy::class;

	/**
	 * @var bool $scopeToUser
	 */
	protected bool $scopeToUser = true;

	/**
	 * @var string|null $serviceClass
	 */
	protected ?string $serviceClass = NotificationService::class;

	/**
	 * @param string|null $model
	 */
	public function __construct(
		protected ?string $model = UserNotification::class
	)
	{
		parent::__construct();
	}

	/**
	 * Validation rules for add/update.
	 *
	 * @return array
	 */
	protected function validate(): array
	{
		return [
			'userId' => 'int|required',
			'type' => 'string:50|required',
			'category' => 'string:50|required',
			'priority' => 'string:10',
			'title' => 'string:255|required',
			'description' => 'string',
			'iconName' => 'string:50'
		];
	}

	/**
	 * Scope the filter to the authenticated user and map the category param.
	 *
	 * @param object|null $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		$filter ??= (object)[];

		$filter->userId = (int)session()->user->id;

		$category = $request->input('category');
		if ($category && $category !== 'all')
		{
			$filter->category = $category;
		}

		return $filter;
	}

	/**
	 * Mark a single notification as read.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function markRead(Request $request): object
	{
		$id = $this->getResourceId($request);
		$userId = session()->user->id;

		if (!$id)
		{
			return $this->error('Notification ID required.');
		}

		$result = $this->service->markRead($id, $userId);
		if (!$result)
		{
			return $this->error('Failed to mark notification as read.');
		}

		return $this->response(['success' => true]);
	}

	/**
	 * Mark all notifications as read for the authenticated user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function markAllRead(Request $request): object
	{
		$userId = session()->user->id;
		$result = $this->service->markAllRead($userId);
		if (!$result)
		{
			return $this->error('Failed to mark notifications as read.');
		}

		return $this->response(['success' => true]);
	}

	/**
	 * Dismiss (soft-delete) a single notification.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function dismiss(Request $request): object
	{
		$id = $this->getResourceId($request);
		$userId = session()->user->id;

		if (!$id)
		{
			return $this->error('Notification ID required.');
		}

		$result = $this->service->dismiss($id, $userId);
		if (!$result)
		{
			return $this->error('Failed to dismiss notification.');
		}

		return $this->response(['success' => true]);
	}

	/**
	 * Get the unread notification count for the authenticated user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function unreadCount(Request $request): object
	{
		$userId = session()->user->id;
		$count = UserNotification::getUnreadCount($userId);
		return $this->response(['count' => $count]);
	}

	/**
	 * Get the Redis channel for notification sync.
	 *
	 * @param Request $request
	 * @return string
	 */
	protected function getSyncChannel(Request $request): string
	{
		$userId = session()->user->id;
		return "notification:user:{$userId}";
	}

	/**
	 * Handle incoming sync message for notifications.
	 *
	 * @param string $channel
	 * @param array $message
	 * @param Request $request
	 * @return array|null|false
	 */
	protected function handleSyncMessage(string $channel, array $message, Request $request): array|null|false
	{
		return [
			'merge' => $message['merge'] ?? []
		];
	}

	/**
	 * Return recent unread notifications formatted for home feed assistant cards.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function feedCards(Request $request): object
	{
		$userId = (int)session()->user->id;
		$limit = $request->getInt('limit') ?: 10;
		$limit = min($limit, 20);

		$cards = $this->service->getFeedCards($userId, $limit);
		return $this->response(['rows' => $cards]);
	}
}
