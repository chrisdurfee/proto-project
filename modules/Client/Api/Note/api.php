<?php declare(strict_types=1);

use Modules\Client\Controllers\ClientNoteController;

/**
 * Notes API Routes
 */
router()->resource('client/:clientId/note', ClientNoteController::class);
