<?php declare(strict_types=1);
namespace Modules\Tracking\Activity\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * ActivityPolicy
 *
 * @package Modules\Tracking\Activity\Auth\Policies
 */
class ActivityPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'activity';

    /**
	 * Checks if the user can access the CRM.
	 *
	 * @return bool True if the user can access the CRM, otherwise false.
	 */
	protected function canAccessCrm(): bool
	{
		return $this->hasPermission('crm.access');
	}

    /**
	 * Default policy for methods that don't have an explicit policy method.
	 *
	 * @param Request $request
	 * @return bool True if the user can view users, otherwise false.
	 */
	public function default(Request $request): bool
	{
		return $this->canAccessCrm();
	}

	/**
	 * Register the current user as viewing a resource.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * List active viewers for a resource.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function getByType(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Stream real-time presence updates for a resource.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function sync(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Remove a user from a resource's active viewers.
	 *
	 * The userId is client-supplied, so a caller may only remove
	 * themselves. Admins and CRM staff may evict any viewer.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function deleteUserByType(Request $request): bool
	{
		if (!$this->isSignedIn())
		{
			return false;
		}

		if ($this->isAdmin() || $this->canAccessCrm())
		{
			return true;
		}

		return $request->getInt('userId') === $this->getUserId();
	}
}
