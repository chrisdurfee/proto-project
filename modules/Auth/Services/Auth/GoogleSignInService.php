<?php declare(strict_types=1);
namespace Modules\Auth\Services\Auth;

use Modules\Auth\Integrations\Google\GoogleService;
use Modules\User\Main\Models\User;
use Modules\User\Services\User\UserImageService;

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
	 * Constructor.
	 *
	 * @param GoogleService $googleService
	 */
	public function __construct(
		protected ?GoogleService $googleService = new GoogleService()
	)
	{
	}

	/**
	 * Get the authorization URL.
	 *
	 * @param string|null $redirectUrl
	 * @return string
	 */
	public function getAuthorizationUrl(?string $redirectUrl = null): string
	{
		return $this->googleService->getAuthorizationUrl($redirectUrl);
	}

	/**
	 * Handle the callback from Google.
	 *
	 * @param string $code
	 * @param bool $createIfMissing
	 * @param string|null $redirectUrl
	 * @return object|null
	 */
	public function handleCallback(string $code, bool $createIfMissing = true, ?string $redirectUrl = null): ?object
	{
		$tokenData = $this->googleService->getAccessToken($code, $redirectUrl);
		if (!$tokenData || !isset($tokenData->access_token))
		{
			return null;
		}

		$profile = $this->googleService->getUserProfile($tokenData->access_token);
		if (!$profile || !isset($profile->email))
		{
			return null;
		}

		// Security check: Ensure the email is verified by Google.
		// This prevents account takeover if someone creates a Google account with an unverified email
		// that matches a system user's email.
		if (empty($profile->email_verified))
		{
			return null;
		}

		if ($createIfMissing === false)
		{
			return $this->getUserByEmail($profile);
		}

		return $this->findOrCreateUser($profile);
	}

	/**
	 * Get user by email.
	 *
	 * @param object $profile
	 * @return User|null
	 */
	protected function getUserByEmail(object $profile): ?User
	{
		$user = modules()->user()->getByEmail($profile->email);
		if (!$user)
		{
			return null;
		}

		if ($user->emailVerifiedAt === null)
		{
			// Mark email as verified
			$user->emailVerifiedAt = date('Y-m-d H:i:s');
			modules()->user()->update($user);
		}
		return $user;
	}

	/**
	 * Upload profile image from URL.
	 *
	 * @param string $imageUrl
	 * @param int $userId
	 * @param UserImageService $imageService
	 * @return string|null
	 */
	protected function uploadProfileImage(
		string $imageUrl,
		int $userId,
		UserImageService $imageService = new UserImageService()
	): ?string
	{
		try
		{
			$response = $imageService->importFromUrl($imageUrl, $userId);
			if (isset($response->success) && $response->success)
			{
				return $response->image ?? null;
			}
		}
		catch (\Exception $e)
		{

		}
		return null;
	}

	/**
	 * Create a new user based on Google profile.
	 *
	 * @param object $profile
	 * @return User|null
	 */
	protected function createNewUser(object $profile): ?User
	{
		$email = $profile->email;
		// Create new user
		$userData = [
			'email' => $email,
			'firstName' => $profile->given_name ?? '',
			'lastName' => $profile->family_name ?? '',
			'displayName' => $profile->name ?? ($profile->given_name ?? '' . ' ' . ($profile->family_name ?? '')),
			'username' => $email, // Fallback username
			'image' => $profile->picture ?? null,
			'emailVerifiedAt' => date('Y-m-d H:i:s'),
			'createdAt' => date('Y-m-d H:i:s'),
			'enabled' => 0,
			'status' => 'online'
		];

		// Generate a random password since they are using Google Auth
		// Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.
		$userData['password'] = 'A1!' . bin2hex(random_bytes(16));

		/**
		 * This will register the user via the User module's gateway.
		 */
		$newUser = modules()->user()->register((object)$userData);

		// Import Google profile picture if available
		if ($newUser && !empty($profile->picture))
		{
			$uploadedImagePath = $this->uploadProfileImage($profile->picture, $newUser->id);
			if ($uploadedImagePath)
			{
				/**
				 * We need to add the new image path to the user.
				 */
				$newUser->image = $uploadedImagePath;
				modules()->user()->update($newUser);
			}
		}
		return $newUser;
	}

	/**
	 * Find or create a user based on the Google profile.
	 *
	 * @param object $profile
	 * @return object
	 */
	protected function findOrCreateUser(object $profile): object
	{
		$user = $this->getUserByEmail($profile);
		if ($user)
		{
			return (object)[
				'user' => $user,
				'isNew' => false
			];
		}

		$user = $this->createNewUser($profile);
		return (object)[
			'user' => $user,
			'isNew' => true
		];
	}
}
