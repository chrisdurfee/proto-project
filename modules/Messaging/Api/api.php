<?php declare(strict_types=1);
namespace Modules\Messaging\Api;

use Modules\Messaging\Controllers\ConversationController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * Messaging API Routes
 *
 * These routes handle conversation and message management.
 *
 * @package Modules\Messaging\Api
 */

// Conversation routes
router()
    ->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
    ->resource('messaging/:userId/conversations', ConversationController::class);