<?php declare(strict_types=1);
namespace Modules\Client\Contact\Auth\Policies;

use Common\Auth\Policies\Policy;

/**
 * ClientContactPolicy
 *
 * @package Modules\Client\Contact\Auth\Policies
 */
class ClientContactPolicy extends Policy
{
    /**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'client.contact';
}
