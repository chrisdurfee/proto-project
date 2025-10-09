<?php declare(strict_types=1);
namespace Common\Services;

use Common\Services\Traits\ResponseTrait;

/**
 * Service
 *
 * This is a base class for services.
 *
 * @package Common\Services
 */
abstract class Service
{
    use ResponseTrait;
}