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
}
