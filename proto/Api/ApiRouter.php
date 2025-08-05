<?php declare(strict_types=1);
namespace
{
	use Proto\Base;
	use Proto\Http\Loop\EventLoop;
	use Proto\Http\Loop\AsyncEvent;
	use Proto\Http\Router\Router;
	use Proto\Http\Session;
	use Proto\Http\Session\SessionInterface;
	use Proto\Http\ServerEvents\ServerEvents;

	/**
	 * @var Base $base This will boostrap the application.
	 */
	new Base();
	Session::init();

	/**
	 * This will create the global router instance.
	 */
	$basePath = env('router')->basePath ?? '/';
	$GLOBALS['router'] = new Router($basePath);

	/**
	 * This will return the router instance.
	 *
	 * @return Router
	 */
	function router(): Router
	{
		return $GLOBALS['router'];
	}

	/**
	 * This will return the session instance.
	 *
	 * @return SessionInterface
	 */
	function session(): SessionInterface
	{
		return Session::getInstance();
	}

	/**
	 * This will set the value to the session.
	 *
	 * @param string $key
	 * @param mixed $value
	 * @return void
	 */
	function setSession(string $key, mixed $value): void
	{
		$session = session();
		$session->{$key} = $value;
	}

	/**
	 * This will get the value from the session.
	 *
	 * @param string $key
	 * @return mixed
	 */
	function getSession(string $key): mixed
	{
		$session = session();
		return $session->{$key} ?? null;
	}

	/**
	 * Creates a server event that triggers at specified intervals.
	 *
	 * @param int $interval
	 * @param callable $callback
	 * @return void
	 */
	function serverEvent(int $interval, callable $callback): void
	{
		$server = new ServerEvents($interval);
        $server->start(function(EventLoop $loop) use($callback)
        {
            $loop->addEvent(new AsyncEvent($callback));
        });
	}

	/**
	 * Creates a server event stream that triggers when data is available.
	 *
	 * @param callable $callback
	 * @return void
	 */
	function eventStream(callable $callback): void
	{
		$server = new ServerEvents();
        $server->stream($callback);
	}
}

namespace Proto\Api
{
	use Proto\Base;
	use Proto\Http\Response;
	use Proto\Http\Router\Request;
	use Proto\Http\Router\Router;
	use Proto\Http\Middleware\CrossSiteProtectionMiddleware;
	use Proto\Http\Middleware\ApiRateLimiterMiddleware;

	/**
	 * Class ApiRouter
	 *
	 * Handles API routing and middleware setup.
	 *
	 * @package Proto\Api
	 */
	class ApiRouter extends Base
	{
		/**
		 * HTTP status code for Not Found.
		 *
		 * @var int
		 */
		private const HTTP_NOT_FOUND = 404;

		/**
		 * The router instance.
		 *
		 * @var Router
		 */
		protected Router $router;

		/**
		 * Sets up the API service by initializing the router and adding routes.
		 *
		 * @return void
		 */
		public function setup(): void
		{
			$this->setupRouter();
			$this->addRoutes();
		}

		/**
		 * Initializes the RouterHelper instance and sets up the API service.
		 *
		 * @return void
		 */
		public static function initialize(): void
		{
			$api = new static();
			$api->setup();
		}

		/**
		 * Sets up the router using the base path from the environment configuration.
		 *
		 * @return void
		 */
		protected function setupRouter(): void
		{
			$this->router = router();
		}

		/**
		 * Adds API routes to the router with the appropriate middleware.
		 *
		 * @return void
		 */
		protected function addRoutes(): void
		{
			$middleware = [
				//CrossSiteProtectionMiddleware::class,
				ApiRateLimiterMiddleware::class,
			];

			$router = $this->router;
			$router->all(':resource.*', function(Request $req): void
			{
				/**
				 * This will get the resource from the request.
				 */
				$resource = $req->params()->resource ?? null;
				if (empty($resource))
				{
					self::error('No resource was specified.', self::HTTP_NOT_FOUND);
					return;
				}

				/**
				 * This will get the resource path from the resource helper.
				 */
				$resourcePath = ResourceHelper::getResource($resource);
				if (!$resourcePath)
				{
					self::error('The resource path is not valid.', self::HTTP_NOT_FOUND);
					return;
				}

				/**
				 * This will load the resource which will add the
				 * resource to the router.
				 */
				ResourceHelper::includeResource($resourcePath);
			}, $middleware);


			/**
			 * This will add the default route which will be used if no route was matched.
			 */
			$router->all('*', function(Request $req): void
			{
				/**
				 * If no route was matched then this will return an error response.
				 */
				self::error('The requested resource is not found.', self::HTTP_NOT_FOUND);
			}, $middleware);
		}

		/**
		 * Creates an error response.
		 *
		 * @param string $message The error message.
		 * @param int $httpCode The HTTP status code.
		 * @return Response The constructed error response.
		 */
		public static function error(string $message, int $httpCode): Response
		{
			return new Response(
				(object)[
					'message' => $message,
					'success' => false
				],
				$httpCode
			);
		}
	}
}