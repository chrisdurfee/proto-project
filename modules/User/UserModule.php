<?php declare(strict_types=1);
namespace Modules\User;

use Modules\User\Main\Auth\Gates\UserGate;
use Modules\User\Role\Auth\Gates\RoleGate;
use Modules\User\Main\Auth\Gates\ResourceGate;
use Modules\User\Permission\Auth\Gates\PermissionGate;
use Modules\User\Organization\Auth\Gates\OrganizationGate;
use Proto\Module\Module;

/**
 * UserModule
 *
 * User management module for handling user-related functionalities.
 *
 * @package Modules\User
 */
class UserModule extends Module
{
	/**
	 * Activates the module and sets up authentication gates.
	 *
	 * @return void
	 */
	public function activate(): void
	{
		$this->setAuthGates();
	}

	/**
	 * Sets up authentication gates for the module.
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