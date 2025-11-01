<?php declare(strict_types=1);
namespace Modules\Messaging\Api\Reaction;

use Modules\Messaging\Controllers\MessageReactionController;

/**
 * MessageReaction Routes
 *
 * This file contains the API routes for the MessageReaction module.
 */
router()
    ->resource('messaging/:messageId/reactions', MessageReactionController::class);