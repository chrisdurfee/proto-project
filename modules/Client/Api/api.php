<?php declare(strict_types=1);
namespace Modules\Client\Api;

use Modules\Client\Controllers\ClientController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Routes
 *
 * This file contains the API routes for the Client module.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client', ClientController::class);