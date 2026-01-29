<?php declare(strict_types=1);
namespace Modules\Client\Main\Auth\Policies;

use Common\Auth\Policies\Policy;

/**
 * ClientPolicy
 *
 * @package Modules\Client\Main\Auth\Policies
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
