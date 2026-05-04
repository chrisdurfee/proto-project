<?php declare(strict_types=1);

use Modules\Client\Main\Controllers\ClientController;

/**
 * Client Main Routes
 *
 * This file contains the API routes for the main Client resource.
 * URL Pattern: /api/client
 */
router()
	->resource('client', ClientController::class);
