<?php declare(strict_types=1);

namespace Modules\Assistant\Gateway;

use Modules\Assistant\Personalization\Gateway\Gateway as PersonalizationGateway;

/**
 * Gateway
 *
 * Root gateway for the Assistant module.
 *
 * @package Modules\Assistant\Gateway
 */
class Gateway
{
    /**
     * Access the Personalization feature gateway.
     *
     * @return PersonalizationGateway
     */
    public function personalization(): PersonalizationGateway
    {
        return new PersonalizationGateway();
    }
}
