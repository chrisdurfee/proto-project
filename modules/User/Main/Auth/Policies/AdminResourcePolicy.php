<?php declare(strict_types=1);
namespace Modules\User\Main\Auth\Policies;

use Proto\Http\Router\Request;

/**
 * AdminResourcePolicy
 *
 * This will create a policy for the admin resource.
 *
 * @package Modules\User\Auth\Policies
 */
class AdminResourcePolicy extends Policy
{
	/**
	 * This will secure all non standard methods.
	 *
	 * @param Request $request The request object.
	 * @return bool
	 */
	public function default(Request $request): bool
	{
		return $this->isAdmin();
	}
}