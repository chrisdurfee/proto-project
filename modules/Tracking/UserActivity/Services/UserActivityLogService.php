<?php declare(strict_types=1);
namespace Modules\Tracking\UserActivity\Services;

use Common\Services\Service;
use Modules\Tracking\UserActivity\Models\UserActivityLog;

/**
 * UserActivityLogService
 *
 * Records and retrieves human-readable user activity entries.
 *
 * @package Modules\Tracking\UserActivity\Services
 */
class UserActivityLogService extends Service
{
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
		$log = new UserActivityLog((object)[
			'userId' => $userId,
			'action' => $action,
			'title' => $title,
			'description' => $description,
			'refId' => $refId,
			'refType' => $refType,
		]);
		$log->add();
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
		return UserActivityLog::getRecentForUser($userId, $limit);
	}
}
