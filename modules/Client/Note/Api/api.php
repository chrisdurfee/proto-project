<?php declare(strict_types=1);

use Modules\Client\Note\Controllers\ClientNoteController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Note Routes
 *
 * This file contains the API routes for the Client Note feature.
 * URL Pattern: /api/client/:clientId/note
 */
router()
    ->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
    ->resource('client/:clientId/note', ClientNoteController::class);
