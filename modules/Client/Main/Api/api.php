<?php declare(strict_types=1);

use Modules\Client\Main\Controllers\ClientController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Main Routes
 *
 * This file contains the API routes for the main Client resource.
 * URL Pattern: /api/client
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client', ClientController::class);
