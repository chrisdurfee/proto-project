<?php declare(strict_types=1);
namespace Modules\Auth\Controllers;

use Modules\User\Main\Models\User;
use Modules\Auth\Services\Auth\MultiFactorAuthService;
use Modules\Auth\Services\Password\PasswordService;
use Modules\Auth\Auth\Policies\PasswordPolicy;
use Proto\Controllers\Controller;
use Proto\Http\Router\Request;
use Proto\Http\Limit;
use Proto\Http\RateLimiter;

/**
 * PasswordController
 *
 * Handles password management, including resets and updates.
 *
 * @package Modules\Auth\Controllers
 */
class PasswordController extends Controller
{
    use AuthTrait;

	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = PasswordPolicy::class;

	/**
	 * Maximum password-reset requests allowed per hour per target
	 * email. Keeps a single account from being flooded with reset
	 * emails/SMS regardless of the source IP.
	 *
	 * @var int
	 */
	private const MAX_RESET_REQUESTS_PER_EMAIL_PER_HOUR = 5;

	/**
	 * Maximum password-reset requests allowed per hour per requesting
	 * IP. Higher than the per-email cap so shared-IP/office traffic
	 * still works, while still bounding how many accounts one IP can
	 * spray reset requests at.
	 *
	 * @var int
	 */
	private const MAX_RESET_REQUESTS_PER_IP_PER_HOUR = 20;

	/**
	 * Window (in seconds) the reset request limits above apply over.
	 *
	 * @var int
	 */
	private const RESET_REQUEST_WINDOW_SECONDS = 3600;

	/**
	 * Constructor.
	 *
	 * @param MultiFactorAuthService $mfaService
	 * @param PasswordService $pwService
	 * @return void
	 */
	public function __construct(
		protected PasswordService $pwService = new PasswordService(),
	)
	{
		parent::__construct();
		$this->user = modules()->user();
	}

	/**
	 * Request a password reset.
	 *
	 * @param Request $req
	 * @return object
	 */
	public function requestPasswordReset(Request $req): object
	{
		$email = $req->input('email');
		if (!isset($email))
		{
			return $this->error(
				'The email is missing.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		/**
		 * Rate limit before the account lookup below so a nonexistent
		 * email is throttled identically to a real one. Otherwise an
		 * attacker could probe unlimited emails with zero rate limiting.
		 * A generic 429 is returned on either limit, so which limit (if
		 * either) tripped is never revealed to the caller.
		 */
		$this->enforcePasswordResetRateLimit($req, (string)$email);

		$user = $this->user->getByEmail($email);
		if ($user)
		{
			$result = $this->pwService->sendResetRequest($user);
			if (empty($result->email) && empty($result->sms))
			{
				return $this->error(
					'The password reset request has failed.',
					HttpStatus::BAD_REQUEST->value
				);
			}
		}

		/**
		 * Always report success, even when no account matched. Returning
		 * a distinct "not found" here would let an attacker enumerate
		 * which emails are registered.
		 */
		return $this->response((object)[
			'message' => 'If an account matches that email, a password reset request has been sent.'
		]);
	}

	/**
	 * Applies throttling to a password-reset request.
	 *
	 * Bounds both how many resets a single email can be sent (flooding a
	 * known account) and how many a single IP can request (spraying many
	 * accounts). Called before the account lookup so real and nonexistent
	 * emails are throttled identically.
	 *
	 * The email key is hashed and case/whitespace-normalized so the raw
	 * address is never a cache key and casing variants cannot open a
	 * fresh bucket.
	 *
	 * @param Request $req
	 * @param string $email Email as submitted by the caller.
	 * @return void
	 */
	protected function enforcePasswordResetRateLimit(Request $req, string $email): void
	{
		$identifier = hash('sha256', strtolower(trim($email)));
		RateLimiter::check(
			(new Limit(self::MAX_RESET_REQUESTS_PER_EMAIL_PER_HOUR))
				->setTimeLimit(self::RESET_REQUEST_WINDOW_SECONDS)
				->by('password-reset-email:' . $identifier)
		);

		$ip = (string)($req->ip() ?? 'unknown');
		RateLimiter::check(
			(new Limit(self::MAX_RESET_REQUESTS_PER_IP_PER_HOUR))
				->setTimeLimit(self::RESET_REQUEST_WINDOW_SECONDS)
				->by('password-reset-ip:' . $ip)
		);
	}

	/**
	 * Validate the password request.
	 *
	 * @param Request $req
	 * @return object
	 */
	public function validatePasswordRequest(Request $req): object
	{
		$requestId = $req->input('requestId');
		$userId = $req->getInt('userId');
		if (!isset($requestId) || !isset($userId))
		{
			return $this->error(
				'The request id or user id is missing.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		$username = $this->pwService->validateRequest($requestId, $userId);
		if ($username === null)
		{
			return $this->error(
				'No request is found.',
				HttpStatus::NOT_FOUND->value
			);
		}

		return $this->response((object)[
			'username' => $username
		]);
	}

	/**
	 * Reset the password for a user.
	 *
	 * @param Request $req
	 * @return object
	 */
	public function resetPassword(Request $req): object
	{
		$userId = $req->getInt('userId');
		if (!isset($userId))
		{
			return $this->error(
				'The user id is not set.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		$password = $req->input('password');
		if (empty($password))
		{
			return $this->error(
				'The password is not set.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		$requestId = $req->input('requestId');
		if (empty($requestId))
		{
			return $this->error(
				'The request id is not set.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		$result = $this->pwService->resetPassword($requestId, $userId, $password);
		if ($result === -1)
		{
			return $this->error(
				'The password reset request is invalid.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		if ($result === false)
		{
			return $this->error(
				'The password reset has failed.',
				HttpStatus::BAD_REQUEST->value
			);
		}

		$user = $this->getUserId($userId);
		if (!$user)
		{
			return $this->error(
				'The user account is not found.',
				HttpStatus::NOT_FOUND->value
			);
		}

		return $this->permit($user, $req->ip());
	}

	/**
	 * Store the authenticated user in session.
	 *
	 * @param User $user
	 * @return void
	 */
	protected function setSessionUser(User $user): void
	{
		setSession('user', $user->getData());
	}
}
