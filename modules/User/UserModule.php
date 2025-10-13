<?php declare(strict_types=1);
namespace Modules\User;

use Modules\User\Auth\Gates\UserGate;
use Modules\User\Auth\Gates\RoleGate;
use Modules\User\Auth\Gates\ResourceGate;
use Modules\User\Auth\Gates\PermissionGate;
use Modules\User\Auth\Gates\OrganizationGate;
use Proto\Module\Module;

/**
 * UserModule
 *
 * This module handles user-related functionality.
 *
 * @package Modules\User
 */
class UserModule extends Module
{
	/**
	 * This will activate the module.
	 *
	 * @return void
	 */
	public function activate(): void
	{
		$this->setAuthGates();
	}

	/**
	 * This will set the authentication gates.
	 *
	 * @return void
	 */
	private function setAuthGates(): void
	{
		/**
		 * Add the module's authentication gates to the auth manager
		 * to allow for user authorization and access control
		 * within the application.
		 */
		$auth = auth();
		$auth->user = new UserGate();
		$auth->role = new RoleGate();
		$auth->resource = new ResourceGate();
		$auth->permission = new PermissionGate();
		$auth->organization = new OrganizationGate();
	}
}