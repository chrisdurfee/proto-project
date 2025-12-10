<?php declare(strict_types=1);
namespace Modules\User\Api\Permission;

use Modules\User\Controllers\PermissionController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Permission Routes
 *
 * Defines the API routes for managing user permissions.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/permission', PermissionController::class);