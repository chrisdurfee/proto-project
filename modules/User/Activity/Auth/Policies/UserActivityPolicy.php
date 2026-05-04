<?php declare(strict_types=1);

namespace Modules\User\Activity\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * UserActivityPolicy
 *
 * Authenticated users may fetch their own aggregated activity stats.
 * The controller scopes results to session()->user->id, so cross-user
 * leakage is impossible.
 */
class UserActivityPolicy extends Policy
{
	/**
	 * @var string|null $type
	 */
	protected ?string $type = 'userActivity';

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function before(Request $request): bool
	{
		return $this->isSignedIn();
	}
}
