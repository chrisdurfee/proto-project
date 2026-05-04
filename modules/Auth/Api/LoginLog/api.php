<?php declare(strict_types=1);
namespace Modules\Auth\Api\LoginLog;

use Modules\Auth\Controllers\LoginLogController;

/**
 * Login Routes
 *
 * This file defines the API routes for user authentication, including
 * login, logout, registration, MFA, and CSRF token retrieval.
 */
router()
	->get('auth/:userId/login-log', [LoginLogController::class, 'all']);
