<?php declare(strict_types=1);
namespace Modules\User\Main\Api;

use Modules\User\Main\Controllers\UserController;

/**
 * User API Routes
 *
 * Defines the API routes for user-related operations.
 *
 * Public endpoints (exempt from CSRF — accessed via email links)
 */
router()
	->withoutMutationMiddleware()
	->patch('user/:id/verify-email', [UserController::class, 'verifyEmail'])
	->withoutMutationMiddleware()
	->patch('user/:id/allow-marketing', [UserController::class, 'allowMarketing'])
	->withoutMutationMiddleware()
	->all('user/unsubscribe', [UserController::class, 'unsubscribe']);

/**
 * Protected endpoints
 */
router()

	/**
	 * Status routes
	 */
	->patch('user/:id/status', [UserController::class, 'updateStatus'])

	/**
	 * Profile routes
	 */
	->patch('user/:id/accept-terms', [UserController::class, 'acceptTerms'])
	->patch('user/:id/update-credentials', [UserController::class, 'updateCredentials'])
	->patch('user/:id/notification-settings', [UserController::class, 'updateNotificationSettings'])
	->patch('user/:id/privacy-settings', [UserController::class, 'updatePrivacySettings'])
	->post('user/:id/upload-image', [UserController::class, 'uploadImage'])
	->post('user/:id/upload-cover-image', [UserController::class, 'uploadCoverImage'])
	->resource('user', UserController::class);