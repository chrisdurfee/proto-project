<?php declare(strict_types=1);
namespace Modules\User\Follower\Api\Followers;

use Modules\User\Follower\Controllers\FollowerController;
use Proto\Http\Router\Router;

/**
 * User Followers Routes
 *
 * This will handle the API routes for the User followers.
 */
router()
	->group('user/:id/follower', function(Router $router)
	{
		$router->get('', [FollowerController::class, 'all']);
		$router->get('following', [FollowerController::class, 'following']);
		$router->post('sync', [FollowerController::class, 'sync']);
		$router->post(':followerId', [FollowerController::class, 'follow']);
		$router->post(':followerId/notify', [FollowerController::class, 'notify']);
		$router->put(':followerId/toggle', [FollowerController::class, 'toggle']);
		$router->delete(':followerId', [FollowerController::class, 'unfollow']);
	});