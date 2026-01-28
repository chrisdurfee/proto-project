<?php declare(strict_types=1);
namespace Modules\Auth\Controllers;

use Modules\User\Main\Models\User;
use Modules\Auth\Controllers\UserStatus;
use Proto\Http\Router\Request;

/**
 * CrmAuthController
 *
 * Handles user login, logout, registration, MFA flows, and CSRF token for CRM users.
 *
 * @package Modules\Auth\Controllers
 */
class CrmAuthController extends AuthController
{
	/**
	 * Handle the Google callback for CRM.
	 *
	 * @param Request $req
	 * @return object
	 */
	public function googleCallback(Request $req): object
	{
		$code = $req->input('code');
		if (!$code)
		{
			return $this->error('No code provided.', HttpStatus::BAD_REQUEST->value);
		}

		$redirectUrl = $req->input('redirectUrl');

		// Do not create new users for CRM login
		$user = $this->googleService->handleCallback($code, false, $redirectUrl);
		if (!$user)
		{
			return $this->error('User not found or access denied.', HttpStatus::UNAUTHORIZED->value);
		}

		return $this->permit($user, $req->ip());
	}

	/**
	 * This will permit a user access to sign in.
	 *
	 * @param User $user
	 * @param string $ip
	 * @return object
	 */
	protected function permit(User $user, string $ip): object
	{
		$this->updateUserStatus($user, UserStatus::ONLINE->value, $ip);
		$this->setSessionUser($user);

		if (auth()->permission->hasPermission('crm.access') === false)
		{
			return $this->error(
				'Access denied. CRM privileges required.',
				HttpStatus::FORBIDDEN->value
			);
		}

		return $this->response([
			'allowAccess' => true,
			'user' => $user->getData()
		]);
	}
}
