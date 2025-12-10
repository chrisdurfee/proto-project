<?php declare(strict_types=1);
namespace Modules\User\Api\Push;

use Modules\User\Controllers\WebPushController;
use Proto\Http\Router\Router;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Push Routes
 *
 * Defines the API routes for managing web push subscriptions for users.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->group('user/:id/push', function(Router $router)
	{
		$router
			->post('subscribe', [WebPushController::class, 'subscribe'])
			->post('unsubscribe', [WebPushController::class, 'unsubscribe']);
	});