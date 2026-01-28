<?php declare(strict_types=1);
namespace Modules\User\Blocked\Api\Blocked;

use Modules\User\Blocked\Controllers\BlockUserController;
use Proto\Http\Router\Router;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User Blocked Routes
 *
 * This will handle the API routes for the User blocked users.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->group('user/:id/blocked', function(Router $router)
	{
		$router->get('', [BlockUserController::class, 'all']);
		$router->post(':blockUserId', [BlockUserController::class, 'block']);
		$router->put(':blockUserId/toggle', [BlockUserController::class, 'toggle']);
		$router->delete(':blockUserId', [BlockUserController::class, 'unblock']);
	});