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
	->resource('tracking/activity', ActivityController::class);