<?php declare(strict_types=1);
namespace Modules\User\Search\Api;

use Modules\User\Search\Controllers\UserSearchController;

/**
 * User Search API Routes
 *
 * Safe, read-only user search endpoint for authenticated users.
 */
router()->resource('user/search', UserSearchController::class);
