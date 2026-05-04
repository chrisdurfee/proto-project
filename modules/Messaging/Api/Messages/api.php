<?php declare(strict_types=1);
namespace Modules\Messaging\Api;

use Modules\Messaging\Controllers\MessageController;
use Modules\Messaging\Controllers\MessageAttachmentController;

/**
 * Messaging API Routes
 *
 * These routes handle conversation and message management.
 *
 * @package Modules\Messaging\Api
 */
router()
	->get('messaging/:conversationId/messages/sync', [MessageController::class, 'sync'])
	->post('messaging/:conversationId/messages/mark-read', [MessageController::class, 'markAsRead'])
	->resource('messaging/:conversationId/messages', MessageController::class);

// Message attachment routes
router()
	->resource('messaging/messages/:messageId/attachments', MessageAttachmentController::class);