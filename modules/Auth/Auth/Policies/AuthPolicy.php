<?php declare(strict_types=1);
namespace Modules\Auth\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * AuthPolicy
 *
 * Controls access to authentication endpoints. Public methods (login,
 * register, MFA, Google flows, CSRF token) are open. Session-dependent
 * methods (logout, resume, pulse, profile updates) require a signed-in user.
 *
 * @package Modules\Auth\Auth\Policies
 */
class AuthPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'auth';

	// ---------------------------------------------------------------
	//  Public endpoints — no authentication required
	// ---------------------------------------------------------------

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function login(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function register(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function getAuthCode(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function verifyAuthCode(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function getToken(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function googleLogin(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function googleCallback(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function googleSignup(Request $request): bool
	{
		return true;
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function googleSignupCallback(Request $request): bool
	{
		return true;
	}

	// ---------------------------------------------------------------
	//  Authenticated endpoints — user must be signed in
	// ---------------------------------------------------------------

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function logout(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function resume(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function pulse(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function getSessionUser(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function setPassword(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function updateProfile(Request $request): bool
	{
		return $this->isSignedIn();
	}
}
