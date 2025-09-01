<?php declare(strict_types=1);
namespace Modules\User\Api\Following;

use Modules\User\Controllers\FollowingController;
use Proto\Http\Router\Router;

/**
 * User Following Routes
 *
 * This will handle the API routes for the User following.
 */
router()
	->group('user/:id/following', function(Router $router)
	{
		$router->get('', [FollowingController::class, 'all']);
	});