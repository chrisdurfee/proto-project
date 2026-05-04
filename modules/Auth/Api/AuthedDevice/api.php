<?php declare(strict_types=1);
namespace Modules\Auth\Api\AuthedDevice;

use Modules\Auth\Controllers\UserAuthedDeviceController;
use Proto\Http\Router\Router;

/**
 * Authed Device Routes
 *
 * This file defines the API routes for user authentication, including
 * login, logout, registration, MFA, and CSRF token retrieval.
 */
router()
	->group('auth/:userId', function(Router $router)
	{
		$router->get('authed-device', [UserAuthedDeviceController::class, 'all']);
		$router->delete('authed-device', [UserAuthedDeviceController::class, 'revokeAll']);
	});
