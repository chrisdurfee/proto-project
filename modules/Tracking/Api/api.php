<?php declare(strict_types=1);
namespace Modules\Tracking\Api;

use Modules\Tracking\Controllers\ActivityController;

/**
 * Tracking Routes
 *
 * This file contains the API routes for the Tracking module.
 */
router()
	->resource('tracking/activity', ActivityController::class);