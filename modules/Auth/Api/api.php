<?php declare(strict_types=1);
namespace Modules\Auth\Api;

use Modules\Auth\Controllers\AuthController;
use Modules\Auth\Controllers\PasswordController;
use Proto\Http\Middleware\DomainMiddleware;
use Proto\Http\Middleware\ThrottleMiddleware;
use Proto\Http\Router\Router;

/**
 * Auth API Routes
 *
 * This file defines the API routes for user authentication, including
 * login, logout, registration, MFA, and CSRF token retrieval.
 */
router()
	->group('auth', function(Router $router)
	{
		$router->post('pulse', [AuthController::class, 'pulse']);
		$router->post('resume', [AuthController::class, 'resume']);
		$router->post('logout', [AuthController::class, 'logout']);

		// Profile management
		$router->post('set-password', [AuthController::class, 'setPassword']);
		$router->post('update-profile', [AuthController::class, 'updateProfile']);

		// Google Auth
		$router->post('google/callback', [AuthController::class, 'googleCallback']);
		$router->post('google/signup/callback', [AuthController::class, 'googleSignupCallback']);

		// Session User
		$router->get('session-user', [AuthController::class, 'getSessionUser']);

		// CSRF Token
		$router->get('csrf-token', [AuthController::class, 'getToken'], [
			DomainMiddleware::class
		]);
	});

router()
	->middleware(([
		ThrottleMiddleware::class
	]))
	->group('auth', function(Router $router)
	{
		// standard login (exempt from CSRF — user has no token yet)
		$router->withoutMutationMiddleware()->post('login', [AuthController::class, 'login']);

		// Registration (exempt from CSRF — user has no token yet)
		$router->withoutMutationMiddleware()->post('register', [AuthController::class, 'register']);

		// MFA: send & verify one‑time codes
		$router->withoutMutationMiddleware()->post('mfa/code', [AuthController::class, 'getAuthCode']);
		$router->withoutMutationMiddleware()->post('mfa/verify', [AuthController::class, 'verifyAuthCode']);

		// Google Auth
		$router->get('google/login', [AuthController::class, 'googleLogin']);
		$router->get('google/signup', [AuthController::class, 'googleSignup']);

		// Password reset: request & verify reset codes
		$router->withoutMutationMiddleware()->post('password/request', [PasswordController::class, 'requestPasswordReset']);
		$router->withoutMutationMiddleware()->post('password/verify', [PasswordController::class, 'validatePasswordRequest']);
		$router->withoutMutationMiddleware()->post('password/reset', [PasswordController::class, 'resetPassword']);
	});
