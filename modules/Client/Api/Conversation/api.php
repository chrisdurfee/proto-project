<?php declare(strict_types=1);
namespace Modules\Client\Api\Conversation;

use Modules\Client\Controllers\Conversation\ClientConversationController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Client Conversation Routes
 *
 * This file contains the API routes for the Client Conversation Controller.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->resource('client/:clientId/conversation', ClientConversationController::class);