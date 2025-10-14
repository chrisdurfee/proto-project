<?php declare(strict_types=1);
namespace Modules\Client\Api\Conversation;

use Modules\Client\Controllers\Conversation\ClientConversationController;

/**
 * ClientConversation Routes
 *
 * This file contains the API routes for the ClientConversation module.
 */
router()
    ->resource('client/:userId/conversation', ClientConversationController::class);