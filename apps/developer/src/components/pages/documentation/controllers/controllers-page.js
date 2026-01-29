import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
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
							icon: Icons.clipboard.checked
						});
					}
				},
				children
			)
		]
	)
));

/**
 * ControllersPage
 *
 * This page documents Proto's controller system. Controllers are used to access models,
 * integrations, and other controllers. They can validate and normalize data, set responses,
 * and dispatch notifications. Child controllers inherit all CRUD methods from a parent controller,
 * reducing repetitive code.
 *
 * @returns {DocPage}
 */
export const ControllersPage = () =>
	DocPage(
		{
			title: 'Controllers',
			description: 'Learn how to use controllers in the Proto framework to manage data, responses, and notifications.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`A controller is a class used to access models, integrations, or other controllers.
					Controllers can validate data, normalize data, set responses, and dispatch email, text,
					and web push notifications. The parent controller provides built-in CRUD methods so that
					child controllers don't need to implement these methods themselves.`
				)
			]),

			// Naming
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Naming'),
				P({ class: 'text-muted-foreground' },
					`The name of a controller should always be singular and followed by "Controller".`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Common\\Controllers;

use Common\\Models\\Example;
use Proto\\Controllers\\ModelController;

class ExampleController extends ModelController
{
}`
				)
			]),

			// Custom Methods
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Custom Methods'),
				P({ class: 'text-muted-foreground' },
					`Controllers can have custom methods to extend their functionality. For instance, a method
					to reset a password might be implemented as follows:`
				),
				CodeBlock(
`public function resetPassword(object $data): object
{
    // Create a model instance with the provided data
    $model = $this->model($data);

    // Process the password reset action via the model
    $result = $model->resetPassword();

    // Wrap the result in a response object for API compatibility
    return $this->response($result);
}`
				)
			]),

			// Controller Response
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Controller Response'),
				P({ class: 'text-muted-foreground' },
					`Controllers return response objects that encapsulate the response data,
					a success flag, and error messages. This standardized response is used by the API system.
					For example, a controller method might look like this:`
				),
				CodeBlock(
`
// single row
public function getByName(string $name)
{
    // Retrieve a user by name using the model
    $row = $this->model::getBy(['name' => $name]);
    if ($row === null)
	{
        return $this->error('No user was found');
    }

    return $this->response($row);
}`
				),

				CodeBlock(
`
// multiple rows
public function getByName(string $name)
{
    // Retrieve a user by name using the model
    $rows = $this->model::fetchWhere(['name' => $name]);
    if ($rows === null)
	{
        return $this->error('No users were found');
    }

    return $this->response($rows);
}`
				),

				CodeBlock(
`
// custom query
public function getByName(string $name)
{
    // Retrieve a user by name using the model
    $rows = $this->model::where(['name' => $name])
        ->orderBy('id DESC')
		->groupBy('id')
		->fetch();

    if ($rows === null)
	{
        return $this->error('No users were found');
    }

    return $this->response($rows);
}`
				)
			]),

			// Api Controllers
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'API Controllers'),
				P({ class: 'text-muted-foreground' },
					`API controllers are used to handle HTTP requests and return responses in a RESTful manner. They typically extend the ResourceController class and interact with models to perform non standard operations.`
				),
				P({ class: 'text-muted-foreground' },
					`These classes are used with the router and can be passed as a resource for a route. The controller method receives the request object when the route is called.`
				),
				P({ class: 'text-muted-foreground' },
					`For example, an API controller might look like this:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;
use Proto\\Http\\Router\\Request;

class SummaryController extends ApiController
{
	public function getSummary(Request $request): object
	{
		// do something
	}
}`
				)
			]),

			// Route Resource Controllers
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Route Resource Controllers'),
				P({ class: 'text-muted-foreground' },
					`Resource controllers are used to manage resources in a RESTful way. The ResourceController class provides full CRUD functionality
					for a model. To create a resource controller, extend the ResourceController class and specify the model class in the constructor.`
				),
				P({ class: 'text-muted-foreground' },
					`These classes are used with the router and can be passed as a resource for a route. The controller method receives the request object when the route is called.`
				),
				P({ class: 'text-muted-foreground' },
					`For example, a resource controller might look like this:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Modules\\User\\Models\\User;
use Proto\\Controllers\\ResourceController;
use Proto\\Http\\Router\\Request;

class UserController extends ResourceController
{
	public function __construct(
		protected ?string $model = User::class
	)
	{
		parent::__construct();
	}

	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		if (empty($data) || empty($data->username))
		{
			return $this->error('No item provided.');
		}

		$isTaken = User::isUsernameTaken($data->username ?? '');
		if ($isTaken)
		{
			return $this->error('Username is already taken.');
		}

		return $this->addItem($data);
	}
}`
				)
			]),

			// ResourceController Hook Methods
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'ResourceController Hook Methods'),
				P({ class: 'text-muted-foreground' },
					`The ResourceController provides hook methods that allow you to modify data before it's processed by the default CRUD operations. These hooks receive the Request object, allowing access to route parameters and request data.`
				),
				P({ class: 'text-muted-foreground font-semibold' },
					`Note: The hook method names contain a typo ("modify" instead of "modify") that must be preserved for compatibility.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Group\\Controllers;

use Modules\\Group\\Models\\Group;
use Proto\\Controllers\\ResourceController;
use Proto\\Http\\Router\\Request;
use Proto\\Utils\\Strings;

class GroupController extends ResourceController
{
    public function __construct(
        protected ?string $model = Group::class
    )
    {
        parent::__construct();
    }

    /**
     * Modify data before add operation.
     * Called by add() BEFORE addItem().
     *
     * @param object $data Data passed by reference
     * @param Request $request The request object
     * @return void
     */
    protected function modifyAddItem(object &$data, Request $request): void
    {
        // Access route parameters from URI
        $params = $request->params();
        $communityId = (int)($params->communityId ?? 0);
        if ($communityId)
        {
            $data->communityId = $communityId;
        }

        // Inject session user
        $data->createdBy = session()->user->id;

        // Sanitize content
        if (isset($data->content))
        {
            $data->content = Strings::prepareContent($data->content);
        }
    }

    /**
     * Modify data before update operation.
     * Called by update() BEFORE updateItem().
     *
     * @param object $data Data passed by reference
     * @param Request $request The request object
     * @return void
     */
    protected function modifyUpdateItem(object &$data, Request $request): void
    {
        // Preserve ID before restricting fields
        $id = $data->id ?? null;

        // Prevent modification of protected fields
        $restrictedFields = ['id', 'communityId', 'createdAt', 'createdBy'];
        $this->restrictFields($data, $restrictedFields);

        // Restore ID after restriction
        $data->id = $id;

        // Track who updated
        $data->updatedBy = session()->user->id;
    }

    /**
     * Modify filter for all() queries.
     * Called by all() to customize the query filter.
     *
     * @param object|null $filter The current filter
     * @param Request $request The request object
     * @return object|null Modified filter
     */
    protected function modifyFilter(?object $filter, Request $request): ?object
    {
        // Add route parameters to filter
        $params = $request->params();
        $communityId = (int)($params->communityId ?? 0);
        if ($communityId)
        {
            $filter = $filter ?? (object)[];
            $filter->communityId = $communityId;
        }

        return $filter;
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`The public methods receive Request, call hooks, then delegate to protected methods:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('add(Request) → modifyAddItem() → addItem(object)'),
					Li('update(Request) → modifyUpdateItem() → updateItem(object)'),
					Li('delete(Request) → deleteItem(object)'),
					Li('all(Request) → modifyFilter() → model query')
				])
			]),

			// Request Parameters
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Request Parameters'),
				P({ class: 'text-muted-foreground' },
					`The Request object provides different methods for accessing parameters from the URL path vs query/body data. Use the appropriate method based on where your data originates.`
				),
				CodeBlock(
`// Route: /communities/:communityId/groups/:id

public function get(Request $request): object
{
    // Access route parameters from URI path
    $params = $request->params();
    $communityId = (int)($params->communityId ?? 0);
    $id = (int)($params->id ?? 0);

    // Access query/body parameters by type
    $name = $request->input('name');        // String parameter
    $limit = $request->getInt('limit');     // Integer parameter
    $active = $request->getBool('active');  // Boolean parameter
    $data = $request->json('item');         // JSON parameter
    $raw = $request->raw('content');        // Raw parameter

    // Get the item from request body
    $item = $this->getRequestItem($request);

    // WRONG: route() method does not exist
    // $id = $request->route('id'); // ❌ Will not work
}`
				),
				P({ class: 'text-muted-foreground' },
					`Available Request methods:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('params() - Returns object with route parameters from URI path'),
					Li('input($key) - Get string parameter from query/body'),
					Li('getInt($key) - Get integer parameter'),
					Li('getBool($key) - Get boolean parameter'),
					Li('json($key) - Get JSON parameter'),
					Li('raw($key) - Get raw parameter'),
					Li('file($key) - Get uploaded file')
				])
			]),

			// Error Handling
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Error Handling'),
				P({ class: 'text-muted-foreground' },
					`Controllers should fail gracefully without throwing exceptions. Use different error methods depending on context:`
				),
				CodeBlock(
`// In hook methods (modifyAddItem, modifyUpdateItem, etc.)
// Use $this->setError() - sets error state and returns
protected function modifyAddItem(object &$data, Request $request): void
{
    $params = $request->params();
    $communityId = (int)($params->communityId ?? 0);
    if (!$communityId)
    {
        $this->setError('Community ID is required');
        return; // Exit hook - parent method will handle error response
    }

    $group = Group::get($data->id ?? 0);
    if (!$group)
    {
        $this->setError('Group not found');
        return;
    }

    // Only reached if no errors
    $data->communityId = $communityId;
}

// In public methods
// Use $this->error() - returns error response object
public function customAction(Request $request): object
{
    $id = $request->getInt('id');
    if (!$id)
    {
        return $this->error('ID is required');
    }

    $item = $this->model::get($id);
    if (!$item)
    {
        return $this->error('Item not found');
    }

    return $this->response($item);
}

// WRONG: Don't throw exceptions in controllers
protected function modifyAddItem(object &$data, Request $request): void
{
    if (!$data->name)
    {
        throw new \\Exception('Name required'); // ❌ Don't do this
    }
}`
				)
			]),

			// Authentication Pattern
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Authentication Pattern'),
				P({ class: 'text-muted-foreground' },
					`Policies handle authentication checks. After policy validation passes, controllers can safely assume the user is authenticated and access session data directly without null checks.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Group\\Controllers;

use Modules\\Group\\Auth\\Policies\\GroupPolicy;
use Modules\\Group\\Models\\Group;
use Proto\\Controllers\\ResourceController;
use Proto\\Http\\Router\\Request;

class GroupController extends ResourceController
{
    // Policy enforces authentication
    protected ?string $policy = GroupPolicy::class;

    public function __construct(
        protected ?string $model = Group::class
    )
    {
        parent::__construct();
    }

    // After policy passes, user is authenticated
    public function join(Request $request): object
    {
        $groupId = $request->getInt('groupId');

        // Safe to access session->user->id after policy check
        $userId = session()->user->id;

        // No need for: if (!$userId) return $this->error('Not authenticated');
        // Policy already handled this

        return $this->service->joinGroup($userId, $groupId);
    }
}`
				)
			]),

			// Pass-Through Responses
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Pass-Through Responses'),
				P({ class: 'text-muted-foreground' },
					`Controllers automatically wraps the result of any undeclared method that is added to it's model or model's storage's public methods call in a Response object. This makes it faster to add new
					resources without rewriting response logic. This allows an empty controller to automatically have access to calling the models public methods.`
				)
			]),

			// Bypassing Pass-Through Responses
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Bypassing Pass-Through Responses'),
				P({ class: 'text-muted-foreground' },
					`To bypass the response wrapper and return the raw model result, call the undeclared controller
					method statically:`
				),
				CodeBlock(
`// Bypass response wrapping
$result = static::$controllerType::methodName();`
				)
			]),

			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Request Item'),
				P({ class: 'text-muted-foreground' },
					`The request item property sets the key name that will be used to get the item value from the request params. By default, the item is set to "item." This property can be overridden to set a custom key name to get the requested item.`
				),
				CodeBlock(
`// in a resource controller
protected string $item = 'example';`
				)
			]),

			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Get Request Item'),
				P({ class: 'text-muted-foreground' },
					`This will get the requested item and decode the value. It will also clean the value.`
				),
				CodeBlock(
`// in a resource controller
public function addUser(Request $request): object
{
    $user = $this->getRequestItem($request);
    // do something with the user
}`
				)
			]),

			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Validation & Sanitize'),
				P({ class: 'text-muted-foreground' },
					`The validator class can validate and sanitize data. The validator accepts an object to validate and the validation settings to document how to validate the data. The validator will validate and sanitize the data by specified data type.`
				),
				CodeBlock(
`$item = (object)[
    'id' => 1,
    'name' => 'name'
];

$validator = Validator::create($item, [
    'id' => 'int|required',
    'name' => 'string'
]);

if ($validator->isValid() === false)
{
    echo $validator->getMessage();
}`
				),
				P({ class: 'text-muted-foreground' },
					`The validator will sanitize and validate the data by specified data type. The supported data types include:`
				),

				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('int'),
					Li("float"),
					Li('string'),
					Li('email'),
					Li('ip'),
					Li('phone'),
					Li("mac"),
					Li("bool"),
					Li("url"),
					Li("domain")
				]),
				P({ class: 'text-muted-foreground' },
					`Fields marked as required will be required to submit the requested item.`
				),
				CodeBlock(
`[
    'id' => 'int|required'
]`
				),
				P({ class: 'text-muted-foreground' },
					`A limit can be set to limit the length of a string. The limit can be set by using the :number rule.`
				),
				CodeBlock(
`[
    'name' => 'string:255|required'
]`
				),

				H4({ class: 'text-lg font-bold' }, 'Validate Method'),
				P({ class: 'text-muted-foreground' },
					`The validate method can be used to set the validating settings for adding and updating a row. The model "id" field is automatically set to "int" and "required" for the update method. The validate method can be overridden to set custom validation settings.`
				),
				CodeBlock(
`/**
 * Validates the request data.
 *
 * This method can be overridden in subclasses to provide specific validation logic.
 *
 * @return array An array of validation rules.
 */
protected function validate(): array
{
	return [
		'id' => 'int|required',
		'name' => 'string:255|required',
		'email' => 'email|required',
		'phone' => 'phone',
		'status' => 'int'
	];
}`
				),

				H4({ class: 'text-lg font-bold' }, 'Custom Validation'),
				P({ class: 'text-muted-foreground' },
					`The validateRules method can access a data object and an array or rules to validate the data.`
				),
				CodeBlock(
`/**
 * Validates the request data.
 *
 * This method can be overridden in subclasses to provide specific validation logic.
 *
 * @return void
 */
public function addData(Request $request): void
{
	$data = $this->getRequestItem($request);
	$this->validateRules($data, [
		'id' => 'int|required',
		'name' => 'string:255|required',
		'email' => 'email|required',
		'phone' => 'phone',
		'status' => 'int'
	]);

	// or you can use a shorthand method from the request
	$data = $request->validate([
		'id' => 'int|required',
		'name' => 'string:255|required',
		'email' => 'email|required',
		'phone' => 'phone',
		'status' => 'int'
	]);

	// if the validation passes, the data will be sanitized and validated
	// if the data fails, an error response will be returned and the request will be terminated

	// do something with the data
}`
				)
			]),

			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Resource Id Parameter'),
				P({ class: 'text-muted-foreground' },
					`The resource controller provides a method to get the resource ID from the request.`
				),
				CodeBlock(
`/**
 * Updates model item status.
 *
 * @param Request $request The request object.
 * @return object The response.
 */
public function updateStatus(Request $request): object
{
	$id = $this->getResourceId($request);
	$status = $request->input('status') ?? null;
	if ($id === null || $status === null)
	{
		return $this->error('The ID and status are required.');
	}

	return $this->response(
		$this->model((object) [
			'id' => $id,
			'status' => $status
		])->updateStatus()
	);
}`
				)
			]),

			// Access Model
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Access Model'),
				P({ class: 'text-muted-foreground' },
					`Controllers can instantiate their associated model by invoking the \`model\` method with model data:`
				),
				CodeBlock(
`// Create a new model instance with provided data
$model = $this->model($data);`
				)
			]),

			// Storage Find and Find All
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Storage Find and Find All'),
				P({ class: 'text-muted-foreground' },
					`Controllers can use the \`find\` and \`findAll\` methods to create ad-hoc, complex queries without
					adding new methods to the model's storage class. For example:`
				),
				CodeBlock(
`// Retrieve all rows matching a custom query
$this->storage()->findAll(fn($sql, &$params) => (
	$params[] = 'active',
	$sql->where('status = ?')
		->orderBy('status DESC')
		->groupBy('user_id')
));

// Retrieve a single row using a custom query
$this->storage()->find(fn($sql, &$params) => (
	$params[] = 'active',
	$sql->where('status = ?')
		->limit(1)
));`
				)
			])
		]
	);

export default ControllersPage;