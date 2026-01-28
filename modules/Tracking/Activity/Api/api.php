<?php declare(strict_types=1);

use Modules\Tracking\Activity\Controllers\ActivityController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Activity Routes
 *
 * This file contains the API routes for the Activity feature.
 * URL Pattern: /api/tracking/activity
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->post('tracking/activity', [ActivityController::class, 'add'])
	->get('tracking/activity/type', [ActivityController::class, 'getByType'])
	->get('tracking/activity/sync', [ActivityController::class, 'sync'])
	->delete('tracking/activity/type', [ActivityController::class, 'deleteUserByType']);
