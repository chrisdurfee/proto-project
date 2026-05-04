<?php declare(strict_types=1);
namespace Modules\Tracking\UserActivity\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * UserActivityLogPolicy
 *
 * @package Modules\Tracking\UserActivity\Auth\Policies
 */
class UserActivityLogPolicy extends Policy
{
	/**
	 * @var string|null $type
	 */
	protected ?string $type = 'userActivityLog';

	/**
	 * Allow any signed-in user to retrieve their own recent activity.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		return $this->isSignedIn();
	}
}
