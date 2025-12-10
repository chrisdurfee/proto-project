<?php declare(strict_types=1);
namespace Modules\User\Api\Role;

use Modules\User\Controllers\RoleController;
use Modules\User\Controllers\RoleUserController;
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