<?php declare(strict_types=1);
namespace Modules\Client\Auth\Policies;

use Common\Auth\Policies\Policy;

/**
 * ClientPolicy
 *
 * @package Modules\Client\Policies
 */
class ClientPolicy extends Policy
{
    /**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'client';
}