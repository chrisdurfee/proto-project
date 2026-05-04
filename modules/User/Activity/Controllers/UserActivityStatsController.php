<?php declare(strict_types=1);

namespace Modules\User\Activity\Controllers;

use Proto\Controllers\ApiController;
use Proto\Http\Router\Request;
use Modules\Vehicle\Mileage\Models\VehicleMileageLog;
use Modules\Community\Event\Attendee\Models\EventAttendee;
use Modules\Post\Main\Models\Post;
use Modules\User\Activity\Auth\Policies\UserActivityPolicy;

/**
 * UserActivityStatsController
 *
 * Aggregates activity for the authenticated user across the
 * vehicle mileage, event attendance, and post modules. Used by
 * the profile "Last 30 days" section.
 *
 *   GET /api/user/activity/stats?days=30
 */
class UserActivityStatsController extends ApiController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = UserActivityPolicy::class;

	/**
	 * Return aggregated stats for the authenticated user over the
	 * trailing N-day window (default 30, max 365).
	 *
	 * @param Request $request
	 * @return object
	 */
	public function stats(Request $request): object
	{
		$userId = (int)session()->user->id;
		$days = $request->getInt('days') ?: 30;
		if ($days < 1)
		{
			$days = 30;
		}
		if ($days > 365)
		{
			$days = 365;
		}

		$endDate = date('Y-m-d');
		$startDate = date('Y-m-d', strtotime('-' . ($days - 1) . ' days'));
		$startDateTime = $startDate . ' 00:00:00';

		// Miles
		$milesDriven = VehicleMileageLog::getTotalForUserBetween($userId, $startDate, $endDate);
		$dailyMap = VehicleMileageLog::getDailyForUserBetween($userId, $startDate, $endDate);
		$milesSeries = $this->buildDailySeries($dailyMap, $startDate, $days);

		// Events
		$eventCount = $this->countAttendedEvents($userId, $startDateTime);

		// Posts
		$postCount = $this->countAuthoredPosts($userId, $startDateTime);

		return $this->response((object)[
			'days' => $days,
			'startDate' => $startDate,
			'endDate' => $endDate,
			'milesDriven' => round($milesDriven, 1),
			'milesSeries' => $milesSeries,
			'eventCount' => $eventCount,
			'postCount' => $postCount
		]);
	}

	/**
	 * Build a contiguous N-day numeric series filling missing days with 0.
	 *
	 * @param array<string, float> $dailyMap
	 * @param string $startDate Y-m-d
	 * @param int $days
	 * @return array<int, float>
	 */
	protected function buildDailySeries(array $dailyMap, string $startDate, int $days): array
	{
		$series = [];
		$startTs = strtotime($startDate);
		for ($i = 0; $i < $days; $i++)
		{
			$key = date('Y-m-d', strtotime('+' . $i . ' days', $startTs));
			$series[] = isset($dailyMap[$key]) ? round((float)$dailyMap[$key], 2) : 0.0;
		}
		return $series;
	}

	/**
	 * Count event attendances for the user since a starting datetime.
	 * Includes registered, checked_in, and waitlist statuses; excludes cancelled.
	 *
	 * @param int $userId
	 * @param string $startDateTime
	 * @return int
	 */
	protected function countAttendedEvents(int $userId, string $startDateTime): int
	{
		$row = EventAttendee::builder()
			->select([['COUNT(*)'], 'total'])
			->where(
				'user_id = ?',
				'created_at >= ?',
				"status IN ('registered', 'checked_in', 'waitlist')"
			)
			->first([$userId, $startDateTime]);

		return $row ? (int)$row->total : 0;
	}

	/**
	 * Count posts authored by the user since a starting datetime (excluding deleted).
	 *
	 * @param int $userId
	 * @param string $startDateTime
	 * @return int
	 */
	protected function countAuthoredPosts(int $userId, string $startDateTime): int
	{
		$row = Post::builder()
			->select([['COUNT(*)'], 'total'])
			->where('user_id = ?', 'created_at >= ?', 'deleted_at IS NULL')
			->first([$userId, $startDateTime]);

		return $row ? (int)$row->total : 0;
	}
}
