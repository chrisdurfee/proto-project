<?php declare(strict_types=1);
namespace Modules\User\Api\Following;

use Modules\User\Controllers\FollowingController;
use Proto\Http\Router\Router;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User Following Routes
 *
 * This will handle the API routes for the User following.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->group('user/:id/following', function(Router $router)
	{
		$router->get('', [FollowingController::class, 'all']);
	});