<?php declare(strict_types=1);
namespace Modules\Developer\Api\SlowQuery;

use Modules\Developer\Controllers\SlowQueryController;
use Proto\Http\Router\Router;

/**
 * Slow Query Routes
 *
 * API routes for MariaDB slow query log browsing.
 */
router()
	->group('developer', function(Router $router)
	{
		$router
			->get('slow-query*', [SlowQueryController::class, 'all']);
	});
