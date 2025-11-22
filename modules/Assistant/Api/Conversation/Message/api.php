<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation\Message;

use Modules\Assistant\Controllers\AssistantMessageController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * This will register the Message API routes.
 */
router()
    ->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
    ->get('assistant/conversation/:conversationId/message/sync', [AssistantMessageController::class, 'sync'])
    ->get('assistant/conversation/:conversationId/message/generate', [AssistantMessageController::class, 'generate'])
    ->resource('assistant/conversation/:conversationId/message', AssistantMessageController::class);