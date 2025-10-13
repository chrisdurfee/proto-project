<?php declare(strict_types=1);
namespace Modules\Client\Api;

use Modules\Client\Controllers\ClientContactController;

/**
 * Client Contact Routes
 *
 * This file contains the API routes for the Client Contact Controller.
 */
router()
	->resource('client/:clientId/contact', ClientContactController::class);