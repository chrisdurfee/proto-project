<?php declare(strict_types=1);
namespace Modules\Assistant\Api\Conversation;

use Modules\Assistant\Controllers\AssistantConversationController;
use Proto\Http\Router\Router;

/**
 * This will register the Conversation API routes.
 */
router()
	->group('assistant/conversation', function(Router $router)
	{
		$router->get('active', [AssistantConversationController::class, 'getActive']);
		$router->get('sync', [AssistantConversationController::class, 'sync']);
		$router->resource('', AssistantConversationController::class);
	});