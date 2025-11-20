<?php declare(strict_types=1);
namespace Modules\User\Gateway;

use Modules\User\Models\RoleUser;
use Modules\User\Models\Role;

/**
 * RoleGateway
 *
 * This will handle the user module role gateway.
 *
 * @package Modules\User\Gateway
 */
class RoleGateway
{
	/**
	 * This will set up the controller.
	 *
	 * @param string $model
	 */
	public function __construct(
		protected string $model = RoleUser::class
	)
	{
	}

    /**
	 * Adds a role to the user.
	 *
	 * @param int $userId The ID of the user.
	 * @param int $roleId The role id to add.
	 * @return bool The result of the operation.
	 */
	public function add(int $userId, int $roleId): bool
	{
        return $this->model::create((object)[
			'userId' => $userId,
			'roleId' => $roleId,
		]);
	}

    /**
     * Removes a role from the user.
     *
     * @param int $userId The ID of the user.
	 * @param int $roleId The role id to add.
	 * @return bool The result of the operation.
	 */
    public function remove(int $userId, int $roleId): bool
    {
        return ($this->model)()->deleteUserRole($userId, $roleId);
    }

    /**
     * Get a role by its slug.
     *
     * @param string $slug The slug of the role.
     * @return object|null The role object or null if not found.
     */
    public function getBySlug(string $slug): ?object
    {
        return Role::getBy(['slug' => $slug]);
    }
}