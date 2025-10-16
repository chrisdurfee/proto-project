<?php declare(strict_types=1);
namespace Modules\User\Api\Organization;

use Modules\User\Controllers\OrganizationController;
use Modules\User\Controllers\OrganizationUserController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User Organization Routes
 *
 * This will handle the API routes for the User Organizations.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('user/:userId/organization', OrganizationUserController::class);

/**
 * Organization Routes
 *
 * This will handle the API routes for Organizations.
 */
router()
	->resource('user/organization', OrganizationController::class);