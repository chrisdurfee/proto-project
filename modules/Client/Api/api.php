<?php declare(strict_types=1);
namespace Modules\Client\Api;

use Modules\Client\Controllers\ClientController;

/**
 * Client Routes
 *
 * This file contains the API routes for the Client module.
 */
router()
    ->resource('client', ClientController::class);