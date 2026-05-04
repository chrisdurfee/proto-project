<?php declare(strict_types=1);

use Modules\Tracking\Activity\Controllers\ActivityController;
use Proto\Http\Router\Router;

/**
 * Activity Routes
 *
 * This file contains the API routes for the Activity feature.
 * URL Pattern: /api/tracking/activity
 */
router()
	->group('tracking/activity', function(Router $router)
	{
		$router->post('', [ActivityController::class, 'add']);
		$router->get('type', [ActivityController::class, 'getByType']);
		$router->get('sync', [ActivityController::class, 'sync']);
		$router->delete('type', [ActivityController::class, 'deleteUserByType']);
	});
