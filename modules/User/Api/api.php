<?php declare(strict_types=1);
namespace Modules\User\Api;

use Modules\User\Controllers\UserController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;

/**
 * User API Routes
 *
 * This file contains the API routes for the User module.
 *
 * NON CSRF endpoints
 */
router()
	->patch('user/:id/verify-email', [UserController::class, 'verifyEmail'])
	->patch('user/:id/allow-marketing', [UserController::class, 'allowMarketing'])
	->all('user/unsubscribe', [UserController::class, 'unsubscribe']);

/**
 * CSRF endpoints
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	/**
	 * Status routes
	 */
	->patch('user/:id/status', [UserController::class, 'updateStatus'])

	/**
	 * Profile routes
	 */
	->patch('user/:id/accept-terms', [UserController::class, 'acceptTerms'])
	->patch('user/:id/update-credentials', [UserController::class, 'updateCredentials'])
	->post('user/:id/upload-image', [UserController::class, 'uploadImage'])
	->resource('user', UserController::class);