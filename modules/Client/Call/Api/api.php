<?php declare(strict_types=1);

use Modules\Client\Call\Controllers\ClientCallController;

/**
 * Client Call Routes
 *
 * This file contains the API routes for the Client Call feature.
 * URL Pattern: /api/client/:clientId/call
 */
router()
	->resource('client/:clientId/call', ClientCallController::class);
