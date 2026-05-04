<?php declare(strict_types=1);

use Modules\Client\Conversation\Controllers\ClientConversationController;

/**
 * Client Conversation Routes
 *
 * This file contains the API routes for the Client Conversation feature.
 * URL Pattern: /api/client/:clientId/conversation
 */
router()
	->get('client/:clientId/conversation/sync', [ClientConversationController::class, 'sync'])
	->resource('client/:clientId/conversation', ClientConversationController::class);
