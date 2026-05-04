<?php declare(strict_types=1);
namespace Modules\User\Following\Api\Following;

use Modules\User\Following\Controllers\FollowingController;
use Proto\Http\Router\Router;

/**
 * User Following Routes
 *
 * Defines the API routes for managing user followings.
 */
router()
	->group('user/:id/following', function(Router $router)
	{
		$router->get('', [FollowingController::class, 'all']);
	});