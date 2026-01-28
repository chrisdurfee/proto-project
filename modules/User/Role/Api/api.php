<?php declare(strict_types=1);
namespace Modules\User\Role\Api\Role;

use Modules\User\Role\Controllers\RoleController;
use Modules\User\Role\Controllers\RoleUserController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User Role Routes
 *
 * Defines the API routes for managing user roles and their assignments.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/:userId/role', RoleUserController::class);

/**
 * Role Routes
 *
 * Defines the API routes for managing user roles.
 */
router()
	->resource('user/role', RoleController::class);