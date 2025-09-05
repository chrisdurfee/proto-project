<?php declare(strict_types=1);
namespace Common\Auth\Policies;

use Proto\Http\Router\Request;

/**
 * Class UserPolicy
 *
 * Policy that governs access control for managing users.
 *
 * @package Common\Auth\Policies
 */
class UserPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'users';

	/**
	 * Determines if the user can get a single user's information.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can view users, otherwise false.
	 */
	public function get(Request $request): bool
	{
		$id = $this->getResourceId($request);
		if ($id === null)
		{
			return false;
		}

		return $this->canAccess('users.view') || $this->ownsResource($id);
	}

	/**
	 * Determines if the user can edit an existing user.
	 *
	 * @param mixed $data User data or ID.
	 * @return bool True if the user can edit users, otherwise false.
	 */
	protected function canEdit(mixed $data): bool
	{
		if ($this->canAccess('users.edit'))
		{
			return true;
		}

		$userId = $data->id ?? null;
		if ($userId === null)
		{
			return false;
		}

		return $this->ownsResource($userId);
	}

	/**
	 * Determines if the user can update an existing user.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can edit users, otherwise false.
	 */
	public function update(Request $request): bool
	{
		$data = $this->controller->getRequestItem($request);
		$data->id = $data->id ?? $this->getResourceId($request);
		if (empty($data) || empty($data->id))
		{
			return false;
		}

		return $this->canEdit($data);
	}

	/**
	 * Determines if the user can edit an existing user.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can edit users, otherwise false.
	 */
	protected function allowEdit(Request $request): bool
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return false;
		}

		return $this->canEdit((object) ['id' => $userId]);
	}

	/**
	 * Determines if the user can update an existing user.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can edit users, otherwise false.
	 */
	public function updateStatus(Request $request): bool
	{
		return $this->allowEdit($request);
	}

	/**
	 * Checks if the resource in the request is owned by the user.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the resource is owned by the user, otherwise false.
	 */
	protected function isOwned(Request $request): bool
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return false;
		}

		return $this->ownsResource($userId);
	}

	/**
	 * Determines if the user can verify their email address.
	 *
	 * @param Request $request The request containing the user ID.
	 * @return bool True if the user can verify their email, otherwise false.
	 */
	public function verifyEmail(Request $request): bool
	{
		return $this->isOwned($request);
	}

	/**
	 * Determines if the user can accept terms.
	 *
	 * @param Request $request The request containing the user ID.
	 * @return bool True if the user can accept terms, otherwise false.
	 */
	public function acceptTerms(Request $request): bool
	{
		return $this->isOwned($request);
	}

	/**
	 * Determines if the user can update their marketing preferences.
	 *
	 * @param Request $request The request containing the user ID.
	 * @return bool True if the user can update marketing preferences, otherwise false.
	 */
	public function allowMarketing(Request $request): bool
	{
		return $this->isOwned($request);
	}

	/**
	 * Determines if the user can unsubscribe.
	 *
	 * @param Request $request The request containing the user ID.
	 * @return bool True if the user can unsubscribe, otherwise false.
	 */
	public function unsubscribe(Request $request): bool
	{
		return true;
	}

	/**
	 * Determines if the user can update their credentials.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function updateCredentials(Request $request): bool
	{
		return $this->allowEdit($request);
	}

	/**
	 * Determines if the user can get roles for a user.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function getRoles(Request $request): bool
	{
		$id = $request->params()->userId ?? null;
		if ($id === null)
		{
			return false;
		}

		return $this->ownsResource($id);
	}

	/**
	 * Uploads and sets the user's profile image.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can upload the image, otherwise false.
	 */
	public function uploadImage(
		Request $request
	): bool
	{
		return $this->allowEdit($request);
	}
}