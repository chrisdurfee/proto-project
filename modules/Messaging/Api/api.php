<?php declare(strict_types=1);

use Modules\Messaging\Controllers\ConversationController;
use Modules\Messaging\Controllers\MessageController;

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

// Message routes
router()
    ->post('messaging/:userId/messages/mark-read', [MessageController::class, 'markAsRead'])
    ->resource('messaging/:userId/messages', MessageController::class);