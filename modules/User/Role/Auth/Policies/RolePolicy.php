<?php declare(strict_types=1);
namespace Modules\User\Role\Auth\Policies;

use Common\Auth\Policies\Policy;

/**
 * Class RolePolicy
 *
 * Policy that governs access control for managing roles.
 *
 * @package Modules\User\Auth\Policies
 */
class RolePolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'role';
}