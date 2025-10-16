<?php declare(strict_types=1);
namespace Modules\User\Api\Role\Permission;

use Modules\User\Controllers\PermissionRoleController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Role Permission Routes
 *
 * This file contains the API routes for the permission module.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/role/:roleId/permission', PermissionRoleController::class);