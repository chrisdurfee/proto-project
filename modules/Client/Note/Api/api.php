<?php declare(strict_types=1);

use Modules\Client\Note\Controllers\ClientNoteController;

/**
 * Client Note Routes
 *
 * This file contains the API routes for the Client Note feature.
 * URL Pattern: /api/client/:clientId/note
 */
router()
    ->resource('client/:clientId/note', ClientNoteController::class);
