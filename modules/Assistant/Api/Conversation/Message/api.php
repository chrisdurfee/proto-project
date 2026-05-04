<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation\Message;

use Modules\Assistant\Controllers\AssistantMessageController;
use Proto\Http\Middleware\DomainMiddleware;
use Proto\Http\Router\Router;

/**
 * This will register the Message API routes.
 */
router()
	->group('assistant/conversation/:conversationId', function(Router $router)
	{
		$router->get('message/sync', [AssistantMessageController::class, 'sync']);
		$router->get('message/generate', [AssistantMessageController::class, 'generate'])->middleware(([
			DomainMiddleware::class
		]));

		$router->resource('message', AssistantMessageController::class);
	});