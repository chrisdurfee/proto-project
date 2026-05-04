<?php declare(strict_types=1);
namespace Modules\Tracking\UserActivity\Gateway;

use Modules\Tracking\UserActivity\Services\UserActivityLogService;

/**
 * Gateway
 *
 * Provides programmatic access to the user activity log.
 *
 * @package Modules\Tracking\UserActivity\Gateway
 */
class Gateway
{
	/**
	 * @var UserActivityLogService $service
	 */
	private UserActivityLogService $service;

	/**
	 * @return void
	 */
	public function __construct()
	{
		$this->service = new UserActivityLogService();
	}

	/**
	 * Record a new activity entry for a user.
	 *
	 * @param int $userId
	 * @param string $action The action type (e.g. 'event_joined', 'group_joined').
	 * @param string $title Human-readable title (e.g. "RSVP'd Cars & Coffee").
	 * @param string|null $description Optional subtitle/context line.
	 * @param int|null $refId Optional reference ID of the related entity.
	 * @param string|null $refType Optional reference type (e.g. 'event', 'group').
	 * @return void
	 */
	public function log(
		int $userId,
		string $action,
		string $title,
		?string $description = null,
		?int $refId = null,
		?string $refType = null
	): void
	{
		$this->service->log($userId, $action, $title, $description, $refId, $refType);
	}

	/**
	 * Retrieve the most recent activity entries for a user.
	 *
	 * @param int $userId
	 * @param int $limit
	 * @return array
	 */
	public function getRecent(int $userId, int $limit = 20): array
	{
		return $this->service->getRecent($userId, $limit);
	}
}
