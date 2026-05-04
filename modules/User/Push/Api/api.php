<?php declare(strict_types=1);

use Modules\User\Push\Controllers\WebPushUserController;

/**
 * Push Notification API routes.
 *
 * All routes are scoped under /api/user/:userId/push.
 */
router()
	->post('user/:userId/push/subscribe', [WebPushUserController::class, 'subscribe'])
	->post('user/:userId/push/unsubscribe', [WebPushUserController::class, 'unsubscribe']);
