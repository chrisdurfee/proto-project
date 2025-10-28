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
    ->resource('conversations', ConversationController::class);

// Message routes
router()
    ->post('messages/mark-read', [MessageController::class, 'markAsRead'])
    ->resource('messages', MessageController::class);