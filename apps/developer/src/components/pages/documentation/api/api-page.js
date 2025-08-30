import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../types/doc/doc-page.js";

/**
 * CodeBlock
 *
 * Creates a code block with copy-to-clipboard functionality.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const CodeBlock = Atom((props, children) => (
	Pre(
		{
			...props,
			class: `flex p-4 max-h-[650px] max-w-[1024px] overflow-x-auto
					 rounded-lg border bg-muted whitespace-break-spaces
					 break-all cursor-pointer mt-4 ${props.class}`
		},
		[
			Code(
				{
					class: 'font-mono flex-auto text-sm text-wrap',
					click: () => {
						navigator.clipboard.writeText(children[0].textContent);
						// @ts-ignore
						app.notify({
							title: "Code copied",
							description: "The code has been copied to your clipboard.",
							icon: null
						});
					}
				},
				children
			)
		]
	)
));

/**
 * ApiPage
 *
 * This page documents Proto's API system. The API system uses a REST router
 * that lets you create routes, redirects, and resources. You can declare middleware
 * on the router or per route. API routes are defined in an api.php file
 * inside the api folder of a module. Nested folders allow deep API paths.
 *
 * @returns {DocPage}
 */
export const ApiPage = () =>
	DocPage(
		{
			title: 'API System',
			description: 'Learn how to build APIs in Proto using a REST router, middleware, resources, and redirects.'
		},
		[
			// Overview Section
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P(
					{ class: 'text-muted-foreground' },
					`Proto's API system is built on a REST router that enables you to define routes, set up redirects,
					and declare resource controllers with ease. Middleware can be applied globally on the router or
					individually on routes. API routes are defined in an api.php file located in the module's API folder.`
				)
			]),

			// API File Structure Section
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'API File Structure'),
				P(
					{ class: 'text-muted-foreground' },
					`APIs are declared in files named api.php inside the api folder of a module.
					You can nest folders in the API folder to create deep API routes. For example:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("Modules/User/Api/api.php"),
					Li("Modules/User/Api/Account/api.php")
				])
			]),

			// Resource Routes Section
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Resource Routes'),
				P({ class: 'text-muted-foreground' },
					`A resource route automatically handles CRUD operations for a controller.
					For example, an API file for the User module might look like this:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Api;

use Modules\\User\\Controllers\\UserController;
use Proto\\Http\\Middleware\\CrossSiteProtectionMiddleware;

/**
 * User API Routes
 *
 * This file contains the API routes for the User module.
 */
router()
    ->middleware([
        CrossSiteProtectionMiddleware::class
    ])
    ->resource('user', UserController::class);`
				),
				P({ class: 'text-muted-foreground' },
					`For deeper routes, nest folders in the API folder. For example, for account-related routes:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Api\\Account;

use Modules\\User\\Controllers\\UserController;

/**
 * User API Routes for Accounts
 *
 * This file handles API routes for user accounts.
 */
router()
    ->resource('user/:userId/account', UserController::class);`
				)
			]),

			// Middleware System Section
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Middleware System'),
				P({ class: 'text-muted-foreground' },
					`Middleware in Proto allows you to filter and process HTTP requests entering your application.
					You can apply middleware globally, to route groups, or to individual routes.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Common\\Http\\Middleware;

use Proto\\Http\\Middleware\\Middleware;
use Proto\\Http\\Router\\Request;
use Proto\\Http\\Router\\Response;

/**
 * Custom authentication middleware
 */
class AuthMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        $token = $request->header('Authorization');
        if (!$token || !$this->validateToken($token))
		{
            return Response::error('Unauthorized', 401);
        }

        // Set authenticated user
        $user = $this->getUserFromToken($token);
        setSession('user', $user);

        return $next($request);
    }

	private function getUserFromToken(string $token): bool
    {
        return User::getBy(['token' => $token]);
    }

    private function validateToken(string $token): bool
    {
        // Token validation logic
        return auth()->token()->validate($token);
    }
}

// Apply middleware to routes
router()
    ->middleware([
        AuthMiddleware::class,
        RateLimitMiddleware::class
    ])
    ->group('protected', function(Router $router) {
        $router->resource('users', UserController::class);
        $router->resource('posts', PostController::class);
    });
`
				)
			]),

			// Error Handling Section
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Error Handling & Responses'),
				P({ class: 'text-muted-foreground' },
					`Proper error handling and consistent response formats are crucial for API development.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;

class UserController extends ApiController
{
    /**
     * Get user with proper error handling.
	 *
	 * @param Request $request
	 * @return object
     */
    public function get(Request $request): object
    {
		$userId = $this->getRequestId($request);
        $user = User::get($userId);
		if (!$user)
		{
			return $this->error('User not found');
		}

		// Check permissions
		if (!auth()->permission()->can('user.view'))
		{
			return $this->error('Insufficient permissions');
		}

		return $this->success($user);
    }

    /**
     * Create user with validation.
	 *
	 * @param Request $request
	 * @return object
     */
    public function create(Request $request): object
    {
        $data = $request->validate([
            'name' => 'required|string:100',
            'email' => 'required|email',
            'password' => 'required|string|min:8'
        ]);

        $result = User::create($data);
        return $this->response($result);
    }

    /**
     * Update user.
     */
    public function update(Request $request): object
    {
		$id = $request->params()->id;
        $user = User::get($id);
        if (!$user)
		{
            return $this->error('User not found');
        }

		$data = $request->json('data');
		if (!$data)
		{
			return $this->error('No data provided');
		}

		$data = $this->validateRules($data, [
            'name' => 'required|string:100',
            'email' => 'required|email',
            'password' => 'required|string|min:8'
        ]);

        $user->set($data);
        $user->update();
        return $this->success($user);
    }

    /**
     * Delete user.
     */
    public function delete(Request $request): object
    {
		$id = $request->params()->id;
        $user = User::get($id);
        if (!$user)
		{
            return $this->notFound('User not found');
        }

        if (!auth()->user()->can('user.delete')) {
            return $this->error('Cannot delete this user');
        }

        $user->delete();
        return $this->response('User deleted successfully');
    }
}
`
				)
			]),

			// Individual Routes Section
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Individual Routes'),
				P({ class: 'text-muted-foreground' },
					`Apart from resource routes, you can also define individual API routes.
					For example:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Http\\Router\\Request;

$router = router();

/**
 * This will get a patient by ID.
 *
 * @param string $req
 * @return object
 */
$router->get('patients/:id/', function(Request $req)
{
	$id = $req->input('module');

	return $req->params();
});

/**
 * This will get a patient by ID.
 *
 * @param Request $req
 * @return object
 */
$router->get('patients/:id/', [PatientController::class, 'get']);

/**
 * This will redirect with a 301 code.
 *
 * @param Request $req
 * @return object
 */
$router->redirect('patients/:id/', './appointments/', 302);

/**
 * This will get a resource with a 301 code.
 *
 * @param Request $req
 * @return object
 */
$router->get('patients/:id?/', function(Request $req)
{
	$params = $req->params();
	// this will set a response code
	$params->code = 301;

	// this will json encode the value
	return $params;
});

/**
 * This will post a resource.
 *
 * @param Request $req
 * @return object
 */
$router->post('patients/:id?/', function(Request $req)
{
	// this will json encode the value
	return $req->params();
});

/**
 * This will get an upload file.
 *
 * @param Request $req
 * @return object
 */
$router->get('appoinmtents/*', function(Request $req)
{
	$file = $req->file('fileName');

	// this will json encode the value
	return $req->params();
});

/**
 * This will always route.
 *
 * @param Request $req
 * @return object
 */
$router->get('*', function($req)
{
	var_dump($req->params());
});
`
				)
			]),

			// group routes Section
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Group Routes'),
				P({ class: 'text-muted-foreground' },
					`You can group routes together to apply common middleware or settings. For example:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Api\\Auth;

use Modules\\User\\Controllers\\AuthController;
use Proto\\Http\\Middleware\\CrossSiteProtectionMiddleware;
use Proto\\Http\\Router\\Router;

/**
 * Auth API Routes
 *
 * This file defines the API routes for user authentication, including
 * login, logout, registration, MFA, and CSRF token retrieval.
 */
router()
	->middleware(([
		CrossSiteProtectionMiddleware::class,
	]))
	->group('user/auth', function(Router $router)
	{
		$controller = new AuthController();
		// standard login / logout / register
		$router->post('login', [$controller, 'login']);
		$router->post('logout', [$controller, 'logout']);
		$router->post('register', [$controller, 'register']);

		// MFA: send & verify one-time codes
		$router->post('mfa/code', [$controller, 'getAuthCode']);
		$router->post('mfa/verify', [$controller, 'verifyAuthCode']);

		// CSRF token (no body, safe to GET)
		$router->get('csrf-token', [$controller, 'getToken']);
	});
`)
		]),

		Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
			H4({ class: 'text-lg font-bold' }, 'Caching'),
			P({ class: 'text-muted-foreground' },
				`Proto supports server-side caching for API responses. It will automatically cache and invalidate cache for registered "resource" routes using Redis. The cache is handled by a Cache Proxy that will run after authentication. If the request is a "GET" request, it will check if the cache exists. If it does, it will return the cached response. If not, it will call the controller and cache the response. Non get methods will clear the cache.`
			)
		])
	]);

export default ApiPage;