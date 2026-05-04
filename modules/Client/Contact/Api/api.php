<?php declare(strict_types=1);

use Modules\Client\Contact\Controllers\ClientContactController;

/**
 * Client Contact Routes
 *
 * This file contains the API routes for the Client Contact feature.
 * URL Pattern: /api/client/:clientId/contact
 */
router()
	->resource('client/:clientId/contact', ClientContactController::class);
