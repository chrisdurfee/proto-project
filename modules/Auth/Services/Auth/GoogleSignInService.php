<?php declare(strict_types=1);
namespace Modules\Auth\Services\Auth;

use Modules\Auth\Integrations\Google\GoogleService;
use Modules\User\Models\User;

/**
 * Class GoogleSignInService
 *
 * Handles Google Sign-In logic.
 *
 * @package Modules\Auth\Services\Auth
 */
class GoogleSignInService
{
	/**
	 * @var GoogleService
	 */
	protected GoogleService $googleService;

	/**
	 * Constructor.
	 */
	public function __construct()
	{
		$this->googleService = new GoogleService();
	}

	/**
	 * Get the authorization URL.
	 *
	 * @return string
	 */
	public function getAuthorizationUrl(): string
	{
		return $this->googleService->getAuthorizationUrl();
	}

	/**
	 * Handle the callback from Google.
	 *
	 * @param string $code
	 * @return User|null
	 */
	public function handleCallback(string $code): ?User
	{
		$tokenData = $this->googleService->getAccessToken($code);
		if (!$tokenData || !isset($tokenData->access_token))
		{
			return null;
		}

		$profile = $this->googleService->getUserProfile($tokenData->access_token);
		if (!$profile || !isset($profile->email))
		{
			return null;
		}

		return $this->findOrCreateUser($profile);
	}

	/**
	 * Find or create a user based on the Google profile.
	 *
	 * @param object $profile
	 * @return User
	 */
	protected function findOrCreateUser(object $profile): User
	{
		$email = $profile->email;
		$user = modules()->user()->getByEmail($email);
		if ($user)
		{
			return $user;
		}

		// Create new user
		$userData = [
			'email' => $email,
			'firstName' => $profile->given_name ?? '',
			'lastName' => $profile->family_name ?? '',
			'username' => $email, // Fallback username
			'image' => $profile->picture ?? null,
			'emailVerifiedAt' => date('Y-m-d H:i:s'),
			'enabled' => 1,
			'status' => 'online'
		];

		// Generate a random password since they are using Google Auth
		// Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.
		$userData['password'] = 'A1!' . bin2hex(random_bytes(16));

		/**
		 * This will register the user via the User module's gateway.
		 */
		return modules()->user()->register((object)$userData);
	}
}
