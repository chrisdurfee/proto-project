<?php declare(strict_types=1);
namespace Modules\Client\Api;

use Modules\Client\Controllers\ClientCallController;

/**
 * Client Call Routes
 *
 * This file contains the API routes for the Client Call Controller.
 */
router()
	->resource('client/:clientId/call', ClientCallController::class);
