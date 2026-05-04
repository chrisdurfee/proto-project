<?php declare(strict_types=1);
namespace Modules\Auth\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * PasswordPolicy
 *
 * All password-reset endpoints are public (security is token-based).
 * The policy exists so every mutation controller has an explicit
 * authorization declaration.
 *
 * @package Modules\Auth\Auth\Policies
 */
class PasswordPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'password';

	/**
	 * All password-reset actions are public.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function default(Request $request): bool
	{
		return true;
	}
}
