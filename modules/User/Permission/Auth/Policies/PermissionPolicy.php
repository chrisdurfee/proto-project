<?php declare(strict_types=1);
namespace Modules\User\Permission\Auth\Policies;

use Proto\Http\Router\Request;
use Modules\User\Main\Auth\Policies\Policy;

/**
 * Class PermissionPolicy
 *
 * Policy that governs access control for viewing or assigning permissions.
 *
 * @package Modules\User\Auth\Policies
 */
class PermissionPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'permissions';

	/**
	 * Determines if the user can assign or create new permissions.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can assign permissions, otherwise false.
	 */
	public function add(Request $request): bool
	{
		return $this->canAccess('permissions.assign');
	}

	/**
	 * Determines if the user can update existing permissions.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can assign permissions, otherwise false.
	 */
	public function update(Request $request): bool
	{
		return $this->canAccess('permissions.assign');
	}

	/**
	 * Determines if the user can delete a permission.
	 *
	 * @param Request $request The request object.
	 * @return bool True if the user can delete permissions, otherwise false.
	 */
	public function delete(Request $request): bool
	{
		return $this->canAccess('permissions.assign');
	}
}
