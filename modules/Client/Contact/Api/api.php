<?php declare(strict_types=1);

use Modules\Client\Contact\Controllers\ClientContactController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Contact Routes
 *
 * This file contains the API routes for the Client Contact feature.
 * URL Pattern: /api/client/:clientId/contact
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client/:clientId/contact', ClientContactController::class);
