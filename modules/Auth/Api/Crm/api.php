<?php declare(strict_types=1);
namespace Modules\Auth\Api\Crm;

use Modules\Auth\Controllers\PasswordController;
use Modules\Auth\Controllers\CrmAuthController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;
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
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->post('auth/crm/pulse', [CrmAuthController::class, 'pulse'])
	->post('auth/crm/resume', [CrmAuthController::class, 'resume'])
	->post('auth/crm/logout', [CrmAuthController::class, 'logout'])

	// Google Auth
	->post('auth/crm/google/callback', [CrmAuthController::class, 'googleCallback'])

	// Session User
	->get('auth/crm/session-user', [CrmAuthController::class, 'getSessionUser'])

	// CSRF Token
	->get('auth/crm/csrf-token', [CrmAuthController::class, 'getToken'], [
		DomainMiddleware::class
	]);

router()
	->middleware(([
		ThrottleMiddleware::class,
	]))
	->group('auth/crm', function(Router $router)
	{
		$controller = new CrmAuthController();
		// standard login
		$router->post('login', [$controller, 'login']);

		// Google Auth
		$router->get('google/login', [$controller, 'googleLogin']);

		// MFA: send & verify one‑time codes
		$router->post('mfa/code', [$controller, 'getAuthCode']);
		$router->post('mfa/verify', [$controller, 'verifyAuthCode']);

		// Password reset: request & verify reset codes
		$controller = new PasswordController();
		$router->post('password/request', [$controller, 'requestPasswordReset']);
		$router->post('password/verify', [$controller, 'validatePasswordRequest']);
		$router->post('password/reset', [$controller, 'resetPassword']);
	});
