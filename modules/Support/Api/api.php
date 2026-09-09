<?php declare(strict_types=1);
namespace Modules\Support\Api;

use Modules\Support\Controllers\SupportMessageController;

/**
 * This will register the Support API routes.
 */
router()
	->resource('support/message', SupportMessageController::class);
