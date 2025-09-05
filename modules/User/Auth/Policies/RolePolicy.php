<?php declare(strict_types=1);
namespace Modules\User\Auth\Policies;

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
	protected ?string $type = 'roles';
}