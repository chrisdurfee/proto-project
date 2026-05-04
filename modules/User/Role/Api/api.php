<?php declare(strict_types=1);
namespace Modules\User\Role\Api\Role;

use Modules\User\Role\Controllers\RoleController;
use Modules\User\Role\Controllers\RoleUserController;

/**
 * User Role Routes
 *
 * Defines the API routes for managing user roles and their assignments.
 */
router()
	->resource('user/:userId/role', RoleUserController::class);

/**
 * Role Routes
 *
 * Defines the API routes for managing user roles.
 */
router()
	->resource('user/role', RoleController::class);