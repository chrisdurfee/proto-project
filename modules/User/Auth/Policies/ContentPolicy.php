<?php declare(strict_types=1);
namespace Modules\User\Auth\Policies;

use Proto\Http\Router\Request;

/**
 * ContentPolicy
 *
 * This policy handles access control for content-related actions.
 *
 * @package Modules\User\Auth\Policies
 */
class ContentPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'content';

	/**
	 * Example: can the user "get" a single content resource?
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can access the content, otherwise false.
	 */
	public function get(Request $request): bool
	{
		$id = $this->getResourceId($request);
		if ($id === null)
		{
			return false;
		}

		return $this->canAccess('content.view') || $this->ownsResource($id);
	}

	/**
	 * Determines if the user can edit an existing user.
	 *
	 * @param mixed $data User data or ID.
	 * @return bool True if the user can edit users, otherwise false.
	 */
	protected function can(string $permission, Request $request): bool
	{
		if ($this->canAccess($permission))
		{
			return true;
		}

		$data = $this->controller->getRequestItem($request);
		$createdBy = $data->createdBy ?? null;
		if ($createdBy === null)
		{
			return false;
		}

		return $this->ownsResource($createdBy);
	}

	/**
	 * Example: can the user "update" existing content?
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can update content, otherwise false.
	 */
	public function update(Request $request): bool
	{
		return $this->can('content.edit', $request);
	}

	/**
	 * Example: can the user "delete" content?
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can delete content, otherwise false.
	 */
	public function delete(Request $request): bool
	{
		return $this->can('content.delete', $request);
	}

	/**
	 * Example: can the user "publish" content?
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can publish content, otherwise false.
	 */
	public function publish(Request $request): bool
	{
		return $this->can('content.publish', $request);
	}
}
