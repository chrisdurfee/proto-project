<?php declare(strict_types=1);

namespace Modules\Assistant\Personalization\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * PersonalizationPolicy
 *
 * Requires the caller to be signed in.
 *
 * @package Modules\Assistant\Personalization\Auth\Policies
 */
class PersonalizationPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'personalization';

	/**
	 * Runs before all methods.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function before(Request $request): bool
	{
		return $this->isSignedIn();
	}
}
