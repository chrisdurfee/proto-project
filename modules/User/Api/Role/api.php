<?php declare(strict_types=1);
namespace Modules\User\Api\Role;

use Modules\User\Controllers\RoleController;
use Modules\User\Controllers\RoleUserController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User Role Routes
 *
 * This will handle the API routes for the User Roles.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/:userId/role', RoleUserController::class);

/**
 * Role Routes
 *
 * This will handle the API routes for the Roles.
 */
router()
	->resource('user/role', RoleController::class);