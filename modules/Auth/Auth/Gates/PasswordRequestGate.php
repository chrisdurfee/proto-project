<?php declare(strict_types=1);
namespace Modules\Auth\Auth\Gates;

use Modules\Auth\Models\PasswordRequest;
use Proto\Auth\Gates\Gate;

/**
 * PasswordRequestGate
 *
 * This will set up the password request gate.
 *
 * @package Modules\Auth\Auth\Gates
 */
class PasswordRequestGate extends Gate
{
	/**
	 * This is the session key name.
	 */
	const PASSWORD_REQUEST_KEY = 'PASSWORD_REQUEST';

	/**
	 * This will set the request.
	 *
	 * @param string $requestId
	 * @param int|string $userId
	 * @return void
	 */
	public function setRequest(string $requestId, int|string $userId): void
	{
		$this->set(self::PASSWORD_REQUEST_KEY, (object)[
			'requestId' => $requestId,
			'userId' => $userId
		]);
	}

	/**
	 * This will get the request.
	 *
	 * @return object|null
	 */
	public function getRequest(): ?object
	{
		return $this->get(self::PASSWORD_REQUEST_KEY);
	}

	/**
	 * This will reset the request.
	 *
	 * @param string $requestId
	 * @return void
	 */
	public function resetRequest(string $requestId): void
	{
		$model = new PasswordRequest();
		$model->updateStatusByRequest($requestId);

		$this->set(self::PASSWORD_REQUEST_KEY, null);
	}

	/**
	 * This will validate the request.
	 *
	 * @param string $requestId
	 * @param int|string $userId
	 * @return string|null
	 */
	public function validateRequest(string $requestId, int|string $userId): ?string
	{
		$model = new PasswordRequest();
		$username = $model->checkRequest($requestId, $userId);
		if ($username === null)
		{
			return null;
		}

		$this->setRequest($requestId, $userId);
		return $username;
	}

	/**
	 * This will compare the request.
	 *
	 * @param string $requestId
	 * @param int|string $userId
	 * @return bool
	 */
	public function compareRequest(string $requestId, int|string $userId): bool
	{
		$request = $this->get(self::PASSWORD_REQUEST_KEY);
		if (empty($request))
		{
			return false;
		}

		if ($request->requestId !== $requestId)
		{
			return false;
		}

		if ($request->userId !== $userId)
		{
			return false;
		}

		return true;
	}
}
