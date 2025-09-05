<?php declare(strict_types=1);
namespace Modules\User\Auth\Policies;

use Proto\Http\Router\Request;

/**
 * Class RoleUserPolicy
 *
 * Policy that governs access control for managing role-user relationships.
 *
 * @package Modules\User\Auth\Policies
 */
class RoleUserPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'users';
}