<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation;

use Modules\Assistant\Controllers\AssistantConversationController;
use Proto\Http\Middleware\CrossSiteProtectionMiddleware;
use Proto\Http\Router\Router;

/**
 * This will register the Conversation API routes.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class
	]))
	->group('assistant/conversation', function(Router $router)
	{
		$controller = new AssistantConversationController();
		$router->get('active', [$controller, 'getActive']);
		$router->get('sync', [$controller, 'sync']);
		$router->resource('', AssistantConversationController::class);
	});