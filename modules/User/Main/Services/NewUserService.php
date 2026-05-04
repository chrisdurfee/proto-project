<?php declare(strict_types=1);
namespace Modules\User\Main\Services;

use Common\Services\Service;
use Modules\User\Main\Controllers\Helpers\UserHelper;
use Modules\User\Main\Email\Welcome\WelcomeVerificationEmail;
use Modules\User\Main\Models\User;
use Modules\User\Role\Models\Role;
use Modules\User\Main\Models\EmailVerification;
use Proto\Dispatch\Dispatcher;

/**
 * NewUserService
 *
 * Sends welcome and verification emails to newly registered users.
 *
 * @package Modules\User\Services\User
 */
class NewUserService extends Service
{
	/**
	 * Send verification email to new user.
	 *
	 * @param User $user
	 * @return object
	 */
	public function sendVerification(User $user): object
	{
		$token = $this->createVerification($user);
		return $this->emailVerification($user, $token);
	}

	/**
	 * This will create a new user and send the verification email.
	 *
	 * @param object $data
	 * @return User|null
	 */
	public function createUser(object $data): ?User
	{
		$email = $data->email ?? $data->username ?? '';
		if ($this->isEmailTaken($email))
		{
			return null;
		}

		$data->email = $email;
		$data->username = $data->username ?? $this->generateUsername($email);
		if (filter_var($data->username, FILTER_VALIDATE_EMAIL))
		{
			$data->username = $this->generateUsername($email);
		}

		// set a random password
		$data->password = bin2hex(random_bytes(20)) . 'Aa1!';
		$data->enabled = $data->enabled ?? 0;

		$user = $this->addUser($data);
		if (!$user || !$user->id)
		{
			return null;
		}

		modules()->tracking()->userActivityLog()->log(
			(int)$user->id,
			'account_created',
			'Joined Rally',
			'Welcome to the community',
			(int)$user->id,
			'user'
		);

		return $user;
	}

	/**
	 * Check if the email is already registered.
	 *
	 * @param string $email
	 * @return bool
	 */
	protected function isEmailTaken(string $email): bool
	{
		if (!$email)
		{
			return true;
		}

		return User::getBy(['email' => $email]) !== null;
	}

	/**
	 * Generate a unique username slug from an email address or a first/last name pair.
	 * When lastName is provided, uses "first_last" format.
	 * When only an email is provided, uses the local part before the "@".
	 *
	 * @param string $emailOrFirst
	 * @param string|null $lastName
	 * @return string
	 */
	protected function generateUsername(string $emailOrFirst, ?string $lastName = null): string
	{
		if ($lastName !== null)
		{
			$base = strtolower(trim($emailOrFirst . '_' . $lastName));
		}
		else
		{
			$base = strtolower(explode('@', $emailOrFirst)[0]);
		}

		$base = preg_replace('/[^a-z0-9_]/', '_', $base);
		$base = preg_replace('/_+/', '_', $base);
		$base = trim($base, '_') ?: 'user';

		$username = $base;
		while ($this->isUsernameTaken($username))
		{
			$username = $base . '_' . rand(100, 9999);
		}

		return $username;
	}

	/**
	 * This will update the user password.
	 *
	 * @param object $data
	 * @return User
	 */
	public function setPassword(object $data): ?User
	{
		$model = User::get($data->id);
		if (!$model)
		{
			return null;
		}

		if (empty($data->password))
		{
			return null;
		}

		return $model->updatePassword($data->password) ? $model : null;
	}

	/**
	 * This will update the user profile and send verification email.
	 *
	 * @param object $data
	 * @return User
	 */
	public function updateProfile(object $data): ?User
	{
		// restrict non-updatable fields
		UserHelper::restrictData($data);
		UserHelper::restrictCredentials($data);

		// Ensure the user is enabled
		$data->enabled = 1;

		$user = $this->updateUser($data);
		if (!$user)
		{
			return null;
		}

		if (!$this->addRoles($user))
		{
			return $user;
		}

		if (empty($user->emailVerifiedAt))
		{
			if (!$this->sendVerification($user))
			{
				return $user;
			}
		}

		modules()->tracking()->userActivityLog()->log(
			(int)$user->id,
			'profile_completed',
			'Completed your profile',
			null,
			(int)$user->id,
			'user'
		);

		return $user;
	}

	/**
	 * Check if the username is already taken.
	 *
	 * @param string $username
	 * @return bool
	 */
	protected function isUsernameTaken(string $username): bool
	{
		return User::isUsernameTaken($username);
	}

	/**
	 * This will add a new user to the database.
	 *
	 * @param object $data
	 * @return User
	 */
	protected function addUser(object $data): User
	{
		$model = new User($data);
		$model->add();
		return $model;
	}

	/**
	 * This will update the user.
	 *
	 * @param object $data
	 * @return User
	 */
	protected function updateUser(object $data): ?User
	{
		$user = User::get($data->id);
		if (!$user)
		{
			return null;
		}

		/**
		 * We want to block any already created profiles.
		 */
		if ($user->enabled === 1)
		{
			return null;
		}

		$user->set($data);
		$result = $user->update();
		if (!$result)
		{
			return null;
		}

		return $user;
	}

	/**
	 * This will add the roles to the user.
	 *
	 * @param User $user
	 * @return bool
	 */
	protected function addRoles(User $user): bool
	{
		$success = true;
		$roles = [
			'user',
			'guest'
		];

		foreach ($roles as $role)
		{
			$result = $this->addRole($user, $role) && $success;
			if (!$result)
			{
				$success = false;
			}
		}
		return $success;
	}

	/**
	 * This will add the role to the user.
	 *
	 * @param User $user
	 * @param string $roleSlug
	 * @return bool
	 */
	protected function addRole(User $user, string $roleSlug): bool
	{
		$role = (new Role())->getBySlug($roleSlug);
		if (!$role)
		{
			return false;
		}

		return $user->roles()->attach($role->id);
	}

	/**
	 * Generate and store email verification token.
	 *
	 * @param User $user
	 * @return string
	 */
	protected function createVerification(User $user): string
	{
		$model = new EmailVerification();
		$model->set('userId', $user->id);
		$model->add();

		return $model->requestId;
	}

	/**
	 * Send the verification email.
	 *
	 * @param User $user
	 * @param string $token
	 * @return object
	 */
	protected function emailVerification(User $user, string $token): object
	{
		$siteName = env('siteName');
		$settings = (object)[
			'to' => $user->email,
			'subject' => 'Welcome to ' . $siteName . '! Please verify your email',
			'template' => WelcomeVerificationEmail::class
		];
		$data = (object)[
			'username' => $user->username,
			'verifyUrl' => $this->buildVerifyUrl($token, $user->id)
		];

		return $this->dispatchEmail($settings, $data);
	}

	/**
	 * Build the public URL for email verification.
	 *
	 * @param string $token
	 * @param mixed $userId
	 * @return string
	 */
	protected function buildVerifyUrl(string $token, mixed $userId): string
	{
		return envUrl() . '/verify-email?token=' . $token . '&userId=' . (string)$userId;
	}

	/**
	 * Queue an email via the app’s enqueue system.
	 *
	 * @param object $settings
	 * @param object|null $data
	 * @return object
	 */
	protected function dispatchEmail(object $settings, ?object $data = null): object
	{
		$settings->queue = true;
		return Dispatcher::email($settings, $data);
	}
}
