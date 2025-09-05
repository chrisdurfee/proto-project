<?php declare(strict_types=1);
namespace Common\Auth\Policies;

use Proto\Auth\Policies\Policy as BasePolicy;
use Proto\Http\Router\Request;

/**
 * Policy
 *
 * This policy handles access control for content-related actions.
 *
 * @package Common\Auth\Policies
 */
class Policy extends BasePolicy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = null;

	/**
	 * Default policy for methods that don't have an explicit policy method.
	 *
	 * @param Request $request
	 * @return bool True if the user can view users, otherwise false.
	 */
	public function default(Request $request): bool
	{
		return $this->checkTypeByMethod($request);
	}

	/**
	 * Checks the permission based on the request method and type.
	 *
	 * @param Request $request
	 * @return boolean
	 */
	public function checkTypeByMethod(Request $request): bool
	{
		$type = $this->type;
		if (!isset($type))
		{
			return true;
		}

		$action = 'view';
		switch ($request->method())
		{
			case 'POST':
				$action = 'create';
				break;
			case 'PUT':
			case 'PATCH':
				$action = 'edit';
				break;
			case 'DELETE':
				$action = 'delete';
				break;
		}

		return $this->hasPermission($type . '.' . $action);
	}

    /**
	 * Check if user is an admin.
	 *
	 * @return bool True if the user is an admin, otherwise false.
	 */
	protected function isAdmin(): bool
	{
		return $this->hasRole('admin');
	}

	/**
	 * Checks if the user has a specific role.
	 *
	 * @param string $roleSlug
	 * @return bool
	 */
	protected function hasRole(string $roleSlug): bool
	{
		return auth()->role->hasRole($roleSlug);
	}

	/**
	 * Helper method to check either "admin" role
	 * or a specific permission slug.
	 *
	 * @param string $permissionSlug The permission slug to check.
	 * @return bool True if the user has the permission, otherwise false.
	 */
	protected function hasPermission(string $permissionSlug): bool
	{
		if ($this->isAdmin())
		{
			return true;
		}
		return auth()->permission->hasPermission($permissionSlug);
	}

    /**
	 * Helper method to check either "admin" role
	 * or a specific permission slug.
	 *
	 * @param string $permissionSlug The permission slug to check.
	 * @return bool True if the user has the permission, otherwise false.
	 */
	protected function canAccess(string $permissionSlug): bool
	{
		return $this->hasPermission($permissionSlug);
	}

	/**
	 * Helper method to check if the user owns a resource.
	 *
	 * @param mixed $ownerId The resource or owner value.
	 * @return bool True if the user owns the resource, otherwise false.
	 */
	protected function ownsResource(mixed $ownerId): bool
	{
		if ($this->isAdmin())
		{
			return true;
		}

		return auth()->resource->isOwner($ownerId);
	}
}