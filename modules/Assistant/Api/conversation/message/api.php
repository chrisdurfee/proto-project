<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation\Message;

use Modules\Assistant\Controllers\AssistantMessageController;

/**
 * This will register the Message API routes.
 */
router()
    ->get('assistant/conversation/:conversationId/message/sync', AssistantMessageController::class, 'sync')
    ->resource('assistant/conversation/:conversationId/message', AssistantMessageController::class);