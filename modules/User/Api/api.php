<?php declare(strict_types=1);
namespace Modules\User\Api;

use Modules\User\Controllers\UserController;

/**
 * User API Routes
 *
 * This file contains the API routes for the User module.
 */
router()

	/**
	 * Status routes
	 */
	->patch('user/:id/status', [UserController::class, 'updateStatus'])

	/**
	 * Email and Terms routes
	 */
	->patch('user/:id/verify-email', [UserController::class, 'verifyEmail'])
	->patch('user/:id/accept-terms', [UserController::class, 'acceptTerms'])
	->all('user/unsubscribe', [UserController::class, 'unsubscribe'])

	/**
	 * Profile routes
	 */
	->patch('user/:id/update-credentials', [UserController::class, 'updateCredentials'])
	->resource('user', UserController::class);