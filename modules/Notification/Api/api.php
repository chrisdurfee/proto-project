<?php declare(strict_types=1);

use Modules\Notification\Controllers\NotificationController;

router()

	// SSE stream — must come before resource() to avoid :id capture
	->get('notification/sync', [NotificationController::class, 'sync'])

	// Aggregate actions
	->get('notification/unread-count', [NotificationController::class, 'unreadCount'])
	->get('notification/feed-cards', [NotificationController::class, 'feedCards'])
	->post('notification/read-all', [NotificationController::class, 'markAllRead'])

	// Single-item actions
	->patch('notification/:id/read', [NotificationController::class, 'markRead'])
	->delete('notification/:id/dismiss', [NotificationController::class, 'dismiss'])

	// Resource routes (GET /notification, GET /notification/:id, etc.) — LAST
	->resource('notification', NotificationController::class);
