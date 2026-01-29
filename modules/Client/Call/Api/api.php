<?php declare(strict_types=1);

use Modules\Client\Call\Controllers\ClientCallController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Call Routes
 *
 * This file contains the API routes for the Client Call feature.
 * URL Pattern: /api/client/:clientId/call
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client/:clientId/call', ClientCallController::class);
