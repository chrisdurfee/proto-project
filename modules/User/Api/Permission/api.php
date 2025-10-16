<?php declare(strict_types=1);
namespace Modules\User\Api\Permission;

use Modules\User\Controllers\PermissionController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Permission Routes
 *
 * This will handle the API routes for the Permissions.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/permission', PermissionController::class);