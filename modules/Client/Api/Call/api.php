<?php declare(strict_types=1);
namespace Modules\Client\Api\Call;

use Modules\Client\Controllers\ClientCallController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Call Routes
 *
 * This file contains the API routes for the Client Call Controller.
 */
router()
    ->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client/:clientId/call', ClientCallController::class);
