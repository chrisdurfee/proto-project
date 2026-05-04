<?php declare(strict_types=1);
namespace Modules\User\Search\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * UserSearchPolicy
 *
 * Any authenticated user can search for other users.
 * Only read operations (all/get) are allowed.
 *
 * @package Modules\User\Search\Auth\Policies
 */
class UserSearchPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'userSearch';

	/**
	 * Allow any signed-in user to list/search users.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Block all mutation operations.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function default(Request $request): bool
	{
		return false;
	}
}
