<?php declare(strict_types=1);
namespace Modules\Client\Api\Contact;

use Modules\Client\Controllers\ClientContactController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Contact Routes
 *
 * This file contains the API routes for the Client Contact Controller.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client/:clientId/contact', ClientContactController::class);