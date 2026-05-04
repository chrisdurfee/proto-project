<?php declare(strict_types=1);
namespace Modules\User\Permission\Api\Permission;

use Modules\User\Permission\Controllers\PermissionController;

/**
 * Permission Routes
 *
 * Defines the API routes for managing user permissions.
 */
router()
	->resource('user/permission', PermissionController::class);