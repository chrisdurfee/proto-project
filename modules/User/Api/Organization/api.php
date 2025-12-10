<?php declare(strict_types=1);
namespace Modules\User\Api\Organization;

use Modules\User\Controllers\OrganizationController;
use Modules\User\Controllers\OrganizationUserController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User Organization Routes
 *
 * Defines the API routes for managing user organizations.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/:userId/organization', OrganizationUserController::class);

/**
 * Organization Routes
 *
 * Defines the API routes for managing organizations.
 */
router()
	->resource('user/organization', OrganizationController::class);