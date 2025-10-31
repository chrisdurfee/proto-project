<?php declare(strict_types=1);
namespace Modules\Messaging\Api;

use Modules\Messaging\Controllers\ConversationController;

/**
 * Messaging API Routes
 *
 * These routes handle conversation and message management.
 *
 * @package Modules\Messaging\Api
 */

// Conversation routes
router()
    ->resource('messaging/:userId/conversations', ConversationController::class);