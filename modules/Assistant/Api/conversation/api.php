<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation;

use Modules\Assistant\Controllers\AssistantConversationController;

/**
 * This will register the Conversation API routes.
 */
router()
    ->get('assistant/conversation/active', AssistantConversationController::class, 'getActive')
    ->get('assistant/conversation/sync', AssistantConversationController::class, 'sync')
    ->resource('assistant/conversation', AssistantConversationController::class);