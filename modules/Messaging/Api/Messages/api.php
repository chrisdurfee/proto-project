<?php declare(strict_types=1);
namespace Modules\Messaging\Api;

use Modules\Messaging\Controllers\MessageController;

/**
 * Messaging API Routes
 *
 * These routes handle conversation and message management.
 *
 * @package Modules\Messaging\Api
 */
router()
    ->post('messaging/:conversationId/messages/mark-read', [MessageController::class, 'markAsRead'])
    ->resource('messaging/:conversationId/messages', MessageController::class);