<?php declare(strict_types=1);
namespace Modules\Messaging\Messages\Api\Reactions;

use Modules\Messaging\Controllers\MessageReactionController;

/**
 * MessageReaction Routes
 *
 * This file contains the API routes for the MessageReaction module.
 */
router()
	->post('messaging/messages/:messageId/reactions/toggle', [MessageReactionController::class, 'toggle'])
	->resource('messaging/messages/:messageId/reactions', MessageReactionController::class);