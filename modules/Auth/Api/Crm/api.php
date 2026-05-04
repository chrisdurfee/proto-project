<?php declare(strict_types=1);
namespace Modules\Auth\Api\Crm;

use Modules\Auth\Controllers\PasswordController;
use Modules\Auth\Controllers\CrmAuthController;
use Proto\Http\Middleware\ThrottleMiddleware;
use Proto\Http\Router\Router;
use Proto\Http\Middleware\DomainMiddleware;

/**
 * Auth Routes
 *
 * This file defines the API routes for user authentication, including
 * login, logout, registration, MFA, and CSRF token retrieval.
 */
router()
	->group('auth/crm', function(Router $router)
	{
		$router->post('pulse', [CrmAuthController::class, 'pulse']);
		$router->post('resume', [CrmAuthController::class, 'resume']);
		$router->post('logout', [CrmAuthController::class, 'logout']);

		// Google Auth
		$router->post('google/callback', [CrmAuthController::class, 'googleCallback']);

		// Session User
		$router->get('session-user', [CrmAuthController::class, 'getSessionUser']);

		// CSRF Token
		$router->get('csrf-token', [CrmAuthController::class, 'getToken'], [
			DomainMiddleware::class
		]);
	});

router()
	->middleware(([
		ThrottleMiddleware::class,
	]))
	->group('auth/crm', function(Router $router)
	{
		// standard login (exempt from CSRF — user has no token yet)
		$router->withoutMutationMiddleware()->post('login', [CrmAuthController::class, 'login']);

		// Google Auth
		$router->get('google/login', [CrmAuthController::class, 'googleLogin']);

		// MFA: send & verify one‑time codes
		$router->withoutMutationMiddleware()->post('mfa/code', [CrmAuthController::class, 'getAuthCode']);
		$router->withoutMutationMiddleware()->post('mfa/verify', [CrmAuthController::class, 'verifyAuthCode']);

		// Password reset: request & verify reset codes
		$router->withoutMutationMiddleware()->post('password/request', [PasswordController::class, 'requestPasswordReset']);
		$router->withoutMutationMiddleware()->post('password/verify', [PasswordController::class, 'validatePasswordRequest']);
		$router->withoutMutationMiddleware()->post('password/reset', [PasswordController::class, 'resetPassword']);
	});
