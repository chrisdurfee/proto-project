<?php declare(strict_types=1);
namespace Modules\Client\Api;

use Modules\Client\Controllers\Conversation\ClientConversationController;

/**
 * Client Conversation Routes
 *
 * This file contains the API routes for the Client Conversation Controller.
 */
router()
	->resource('client/:clientId/conversation', ClientConversationController::class);