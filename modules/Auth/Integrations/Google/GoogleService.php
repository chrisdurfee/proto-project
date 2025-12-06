<?php declare(strict_types=1);

namespace Modules\Auth\Integrations\Google;

use Proto\Integrations\Oauth2Service;

/**
 * Class GoogleService
 *
 * Integration with Google OAuth2.
 *
 * @package Modules\Auth\Integrations\Google
 */
class GoogleService extends Oauth2Service
{
	/**
	 * The authorization URL.
	 *
	 * @var string
	 */
	protected string $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

	/**
	 * The token URL.
	 *
	 * @var string
	 */
	protected string $tokenUrl = 'https://oauth2.googleapis.com/token';

	/**
	 * The user info URL.
	 *
	 * @var string
	 */
	protected string $userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

	/**
	 * Constructor.
	 */
	public function __construct()
	{
        $settings = env('apis')->google ?? throw new \Exception('Google API settings not configured.');

		parent::__construct(
			$settings->clientId,
			$settings->clientSecret,
			$settings->redirectUrl
		);
	}

	/**
	 * Get the authorization URL.
	 *
	 * @return string
	 */
	public function getAuthorizationUrl(): string
	{
		$params = [
			'client_id' => $this->clientId,
			'redirect_uri' => $this->redirectUrl,
			'response_type' => 'code',
			'scope' => 'email profile openid',
			'access_type' => 'offline',
			'prompt' => 'consent'
		];

		return $this->authUrl . '?' . http_build_query($params);
	}

	/**
	 * Get the access token from the code.
	 *
	 * @param string $code
	 * @return object|null
	 */
	public function getAccessToken(string $code): ?object
	{
		$params = [
			'client_id' => $this->clientId,
			'client_secret' => $this->clientSecret,
			'redirect_uri' => $this->redirectUrl,
			'grant_type' => 'authorization_code',
			'code' => $code
		];

		$response = $this->request('POST', $this->tokenUrl, $params);
		return $response->data ?? null;
	}

	/**
	 * Get the user profile.
	 *
	 * @param string $accessToken
	 * @return object|null
	 */
	public function getUserProfile(string $accessToken): ?object
	{
		$headers = [
			'Authorization' => 'Bearer ' . $accessToken
		];

		$response = $this->request('GET', $this->userInfoUrl, [], $headers);
		return $response->data ?? null;
	}
}
