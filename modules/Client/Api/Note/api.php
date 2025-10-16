<?php declare(strict_types=1);
namespace Modules\Client\Api\Note;

use Modules\Client\Controllers\ClientNoteController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Notes API Routes
 */
router()
    ->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
    ->resource('client/:clientId/note', ClientNoteController::class);
