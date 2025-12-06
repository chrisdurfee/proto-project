<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation\Message;

use Modules\Assistant\Controllers\AssistantMessageController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;
use Proto\Http\Middleware\DomainMiddleware;
use Proto\Http\Router\Router;

/**
 * This will register the Message API routes.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->group('assistant/conversation/:conversationId', function(Router $router)
	{
		$controller = new AssistantMessageController();
		$router->get('message/sync', [$controller, 'sync']);
		$router->get('message/generate', [$controller, 'generate'])->middleware(([
			DomainMiddleware::class
		]));

		$router->resource('message', AssistantMessageController::class);
	});