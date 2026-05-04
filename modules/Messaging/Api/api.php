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

router()
	->get('messaging/:userId/conversations/sync', [ConversationController::class, 'sync'])
	->post('messaging/:userId/conversations/find-or-create', [ConversationController::class, 'findOrCreate'])
	->resource('messaging/:userId/conversations', ConversationController::class);