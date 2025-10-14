<?php declare(strict_types=1);
namespace Modules\Client\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * ClientResourcePolicy
 *
 * @package Modules\Client\Policies
 */
class ClientResourcePolicy extends Policy
{
    /**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'client';

    /**
	 * Default policy for methods that don't have an explicit policy method.
	 *
	 * @param Request $request
	 * @return bool True if the user can view users, otherwise false.
	 */
	public function default(Request $request): bool
	{
		return $this->hasPermission('crm.access');
	}
}