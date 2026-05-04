<?php declare(strict_types=1);
namespace Modules\User\Role\Api\Role\Permission;

use Modules\User\Role\Controllers\PermissionRoleController;

/**
 * Role Permission Routes
 *
 * Defines the API routes for managing permissions associated with user roles.
 */
router()
	->resource('user/role/:roleId/permission', PermissionRoleController::class);