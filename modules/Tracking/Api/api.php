<?php declare(strict_types=1);
namespace Modules\Tracking\Api;

use Modules\Tracking\Controllers\ActivityController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Tracking Routes
 *
 * This file contains the API routes for the Tracking module.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->post('tracking/activity', [ActivityController::class, 'add'])
	->get('tracking/activity/type', [ActivityController::class, 'getByType'])
	->get('tracking/activity/sync', [ActivityController::class, 'sync'])
	->delete('tracking/activity/type', [ActivityController::class, 'deleteUserByType']);