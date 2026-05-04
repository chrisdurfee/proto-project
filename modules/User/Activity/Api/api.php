<?php declare(strict_types=1);

use Modules\User\Activity\Controllers\UserActivityStatsController;

/**
 * User Activity Routes
 *
 *   GET /api/user/activity/stats?days=30
 */
router()
	->get('user/activity/stats', [UserActivityStatsController::class, 'stats']);
