<?php declare(strict_types=1);
namespace Modules\User\Organization\Api\Organization;

use Modules\User\Organization\Controllers\OrganizationController;
use Modules\User\Organization\Controllers\OrganizationUserController;

/**
 * User Organization Routes
 *
 * Defines the API routes for managing user organizations.
 */
router()
	->resource('user/:userId/organization', OrganizationUserController::class);

/**
 * Organization Routes
 *
 * Defines the API routes for managing organizations.
 */
router()
	->resource('user/organization', OrganizationController::class);