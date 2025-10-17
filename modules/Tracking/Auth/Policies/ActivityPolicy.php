<?php declare(strict_types=1);
namespace Modules\Tracking\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * ActivityPolicy
 *
 * @package Modules\Tracking\Policies
 */
class ActivityPolicy extends Policy
{
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
		return (!$this->canAccessCrm());
	}
}