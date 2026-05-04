<?php declare(strict_types=1);

use Modules\Tracking\UserActivity\Controllers\UserActivityLogController;

/**
 * User Activity Log Routes
 *
 * URL: /api/tracking/user-activity
 */
router()->get('tracking/user-activity', [UserActivityLogController::class, 'all']);
