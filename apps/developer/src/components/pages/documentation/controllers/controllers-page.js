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

			// User-Scoped Controllers
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'User-Scoped Controllers'),
				P({ class: 'text-muted-foreground' },
					`When a controller's resources are always owned by the authenticated user, use \`$scopeToUser\` to automatically
					inject the user ID on add and filter results to only the authenticated user's records on list/all.`
				),
				CodeBlock(
`class BookmarkController extends ResourceController
{
	protected ?string $policy = BookmarkPolicy::class;
	protected bool $scopeToUser = true; // Auto-injects and filters by userId

	public function __construct(protected ?string $model = Bookmark::class)
	{
		parent::__construct();
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`By default, \`$scopeToUser\` uses \`userId\` as the field name. Override with \`$userScopeField\` if the model uses a different column:`
				),
				CodeBlock(
`class EventController extends ResourceController
{
	protected bool $scopeToUser = true;
	protected string $userScopeField = 'hostId'; // Uses hostId instead of userId

	public function __construct(protected ?string $model = Event::class)
	{
		parent::__construct();
	}
}`
				),
				P({ class: 'text-muted-foreground font-semibold' },
					`Note: \`$scopeToUser\` requires a policy to be set (since it reads \`session()->user->id\`). Without a policy, the session user may not be available.`
				)
			]),

			// Route Parameter Auto-Injection
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Route Parameter Auto-Injection ($routeParams)'),
				P({ class: 'text-muted-foreground' },
					`Set \`$routeParams\` to auto-inject route parameters into add data and auto-filter on all(). This eliminates the most common modifyAddItem()/modifyFilter() override pattern.`
				),
				CodeBlock(
`// Zero-override nested resource controller
class ForumPostController extends ResourceController
{
    protected array $routeParams = [
        'forumId' => true, // Required, auto-injected on add, auto-filtered on all()
    ];

    public function __construct(protected ?string $model = ForumPost::class)
    {
        parent::__construct();
    }

    // No modifyAddItem() or modifyFilter() needed for forumId!
}`
				),
				P({ class: 'text-muted-foreground' },
					`Keys are the route param name, values control behavior: true = required (setError if missing), false = optional (apply only if present). Override hooks when extra logic is needed beyond route params — call parent::modifyAddItem() to preserve auto-injection.`
				)
			]),

			// Query String Filter Params
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Query String Filter Params ($filterParams)'),
				P({ class: 'text-muted-foreground' },
					`Set \`$filterParams\` for declarative query-string-to-filter mapping. Combined with \`$routeParams\`, this eliminates 90%+ of modifyFilter() overrides.`
				),
				CodeBlock(
`// Both route and query params auto-applied
class ForumPostController extends ResourceController
{
    protected array $routeParams = ['forumId' => true];  // From URL path
    protected array $filterParams = ['topicId' => 'int']; // From query string

    // Zero modifyFilter() override needed
}`
				),
				P({ class: 'text-muted-foreground' },
					`Maps param name to type ('int', 'string', 'bool'). Query string values are auto-cast and applied as filter conditions.`
				)
			]),

			// Enrich User Fields
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Enrich User Fields ($enrichUserFields)'),
				P({ class: 'text-muted-foreground' },
					`Set \`$enrichUserFields\` to auto-attach session user fields to add/update responses so the UI can render the author's name/avatar without a refetch.`
				),
				CodeBlock(
`class ForumPostController extends ResourceController
{
    protected array $enrichUserFields = [
        'firstName', 'lastName', 'image', 'username', 'verified'
    ];

    // After add/update, response automatically includes:
    // { id: 123, firstName: 'John', lastName: 'Doe', image: '...', ... }
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
        // Track who updated
        $data->updatedBy = session()->user->id;

        // NOTE: If the model declares $immutableFields, the framework
        // auto-strips those fields on update. No manual restrictFields()
        // call is needed. Only use restrictFields() if the model does
        // NOT have $immutableFields set.
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
					Li('all(Request) → modifyFilter() → model query → enrichRows()'),
					Li('get(Request) → model fetch → getData() → enrichRow()')
				])
			]),

			// Enrichment Hooks
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Enrichment Hooks'),
				P({ class: 'text-muted-foreground' },
					`The ResourceController provides enrichment hooks that run after data is fetched. Use these to append computed properties, user-specific flags, or related data without overriding get() or all().`
				),
				P({ class: 'text-muted-foreground' },
					`The get() method now calls getData() internally, so result->row is always a plain object (consistent with all()). Never call ->getData() on result->row in controller overrides — the framework handles this.`
				),
				P({ class: 'text-muted-foreground font-semibold' },
					`CRITICAL: Never override get() or all() just to append flags like isFavorited or isBookmarked. Use enrichment hooks instead.`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('enrichRow(object &$row, Request $request) — called after get() fetches a single row. Auto-delegates to enrichRows() by default.'),
					Li('enrichRows(array &$rows, Request $request) — called after all() fetches multiple rows. Override this — enrichRow() reuses it automatically.')
				]),
				P({ class: 'text-muted-foreground' },
					`enrichRow() auto-delegates to enrichRows(): You only need to implement enrichRows(). The single-item get() path automatically wraps the row in an array and calls enrichRows(). Override enrichRow() individually only if the single-item path genuinely needs different logic.`
				),
				H4({ class: 'font-semibold mt-4' }, 'BatchEnrichmentTrait (Recommended)'),
				P({ class: 'text-muted-foreground' },
					`Use BatchEnrichmentTrait for declarative batch-fetch helpers that eliminate manual map-building. It provides batchMapField() and batchMapExists() — each does a single IN query per call.`
				),
				CodeBlock(
`use Proto\\Controllers\\Traits\\BatchEnrichmentTrait;

class ForumPostController extends ResourceController
{
    use BatchEnrichmentTrait;

    protected function enrichRows(array &$rows, Request $request): void
    {
        $userId = session()->user->id;

        // Map topic names: topicId → topicName
        $this->batchMapField(
            $rows, ForumTopic::class,
            'id', 'name', 'topicName', '',
            [], 'topicId'
        );

        // Map user votes: postId → voteType
        $this->batchMapField(
            $rows, ForumPostVote::class,
            'postId', 'voteType', 'userVote', null,
            [['userId', $userId]]
        );

        // Boolean: user bookmarked?
        $this->batchMapExists(
            $rows, Bookmark::class,
            'itemId', 'bookmarked',
            [['userId', $userId], ['itemType', 'forum_post']]
        );
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`Available BatchEnrichmentTrait methods:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('batchMapField($rows, $modelClass, $foreignKey, $valueField, $targetField, $default, $extraFilter, $sourceKey) — batch-fetch a value from related records and map onto rows'),
					Li('batchMapExists($rows, $modelClass, $foreignKey, $targetField, $extraFilter, $sourceKey) — batch-check existence and set a boolean flag')
				]),
				H4({ class: 'font-semibold mt-4' }, 'Manual Enrichment'),
				P({ class: 'text-muted-foreground' },
					`When you need more control than BatchEnrichmentTrait provides, build the maps manually using IN-queries:`
				),
				CodeBlock(
`protected function enrichRows(array &$rows, Request $request): void
{
    $userId = session()->user->id ?? null;
    if (!$userId || empty($rows))
    {
        return;
    }

    $vehicleIds = array_map(fn($r) => (int)$r->id, $rows);

    $favorites = UserFavoriteVehicle::fetchWhere([
        'userId' => $userId,
        ['vehicleId', 'IN', $vehicleIds]
    ]);
    $favSet = array_flip(
        array_map(fn($f) => (int)$f->vehicleId, $favorites ?? [])
    );

    $bookmarks = Bookmark::fetchWhere([
        'userId' => $userId,
        'itemType' => 'vehicle',
        ['itemId', 'IN', $vehicleIds]
    ]);
    $bmSet = array_flip(
        array_map(fn($b) => (int)$b->itemId, $bookmarks ?? [])
    );

    foreach ($rows as &$row)
    {
        $vid = (int)$row->id;
        $row->isFavorited = isset($favSet[$vid]);
        $row->isBookmarked = isset($bmSet[$vid]);
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`When to use each approach:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('BatchEnrichmentTrait — preferred for standard lookups (boolean flags, single-field mapping)'),
					Li('Manual enrichment — when you need custom logic, multiple fields per lookup, or complex transformations'),
					Li('Only implement enrichRows() — enrichRow() auto-delegates by default')
				]),
				P({ class: 'text-muted-foreground mt-2' },
					`The IN shorthand in filter arrays auto-generates placeholders from an array of values, eliminating manual implode/placeholder code:`
				),
				CodeBlock(
`// IN / NOT IN with arrays (auto-generates placeholders)
$filter = [
    ['userId', 'IN', [1, 2, 3]],              // user_id IN (?, ?, ?)
    ['status', 'NOT IN', ['banned', 'deleted']], // status NOT IN (?, ?)
    ['a.replyId', 'IN', $replyIds],            // works with table aliases
];

// Combine with other filter formats
$results = static::fetchWhere([
    ['userId', $userId],
    ['vehicleId', 'IN', $vehicleIds]
]);`
				)
			]),

			// Filter Helper Methods
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Filter Helper Methods (Proto\\Storage\\Filter)'),
				P({ class: 'text-muted-foreground' },
					`Proto provides static helper methods on the Filter class to eliminate raw SQL strings from filter arrays. These generate parameterized, sanitized filter entries and can be used anywhere filters are built — in controllers, services, or models.`
				),
				P({ class: 'text-muted-foreground' },
					`In development mode, Proto logs a deprecation warning when raw SQL strings are used as filter values. Use these helpers to migrate away from raw SQL filters.`
				),
				H4({ class: 'font-semibold' }, 'Available Methods'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('Filter::exists($table, $alias, $joinCondition, $conditions) — EXISTS subquery, returns [sql, [params]]'),
					Li('Filter::notExists($table, $alias, $joinCondition, $conditions) — NOT EXISTS subquery, returns [sql, [params]]'),
					Li('Filter::aliased($alias, $column, $value, $operator) — sanitized alias.column filter entry, auto snake_case'),
					Li('Filter::condition($alias, $column, $expression) — whitelisted static SQL condition (IS NULL, > NOW(), etc.)')
				]),
				H4({ class: 'font-semibold mt-4' }, 'EXISTS / NOT EXISTS Subqueries'),
				P({ class: 'text-muted-foreground' },
					`Replaces raw EXISTS (SELECT 1 FROM ...) strings. Returns [sql, [params]] that can be added directly to any filter array.`
				),
				CodeBlock(
`use Proto\\Storage\\Filter;

// EXISTS subquery
Filter::exists(
    'event_attendees',       // table name
    'ea',                    // alias for subquery
    'ea.event_id = e.id',    // join condition linking to parent
    [                        // additional parameterized conditions
        ['ea.user_id', $userId],
        ['ea.status', 'IN', ['registered', 'waitlist']]
    ]
);

// NOT EXISTS — same API
Filter::notExists(
    'event_attendees', 'ea', 'ea.event_id = e.id',
    [['ea.user_id', $userId]]
);`
				),
				H4({ class: 'font-semibold mt-4' }, 'Aliased Filters'),
				P({ class: 'text-muted-foreground' },
					`Sanitizes the alias and column name, converts to snake_case, and returns a filter entry. Supports optional operators.`
				),
				CodeBlock(
`// Simple equality
Filter::aliased('e', 'status', 'published');
// → ['e.status', 'published']

// With operator
Filter::aliased('e', 'startDate', $date, '>=');
// → ['e.start_date', '>=', $date]`
				),
				H4({ class: 'font-semibold mt-4' }, 'Static Conditions'),
				P({ class: 'text-muted-foreground' },
					`Returns a safe static SQL string. Only whitelisted expressions are allowed (IS NULL, IS NOT NULL, > NOW(), >= NOW(), < NOW(), <= NOW(), = NOW()). Unrecognized expressions return '1=1' and trigger a warning.`
				),
				CodeBlock(
`Filter::condition('e', 'deletedAt', 'IS NULL');
// → 'e.deleted_at IS NULL'

Filter::condition('e', 'startDate', '> NOW()');
// → 'e.start_date > NOW()'`
				),
				H4({ class: 'font-semibold mt-4' }, 'Complete Example'),
				P({ class: 'text-muted-foreground' },
					`Build a fully parameterized filter with zero raw SQL strings:`
				),
				CodeBlock(
`use Proto\\Storage\\Filter;

$filter = [
    Filter::aliased('e', 'status', 'published'),
    Filter::condition('e', 'deletedAt', 'IS NULL'),
    Filter::condition('e', 'startDate', '> NOW()'),
    Filter::exists('event_attendees', 'ea', 'ea.event_id = e.id', [
        ['ea.user_id', $userId],
        ['ea.status', 'IN', ['registered', 'waitlist']]
    ])
];

$events = Event::all($filter, $offset, $limit, $modifiers);`
				)
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
			]),

			// File Upload Helpers
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'File Upload Helpers'),
				P({ class: 'text-muted-foreground' },
					`ResourceController provides built-in helpers for single and batch file uploads, wrapping the validate → store → getNewName lifecycle in a single call.`
				),
				CodeBlock(
`/**
 * Validate and store an uploaded file, returning the new filename.
 *
 * @param Request $request The request object.
 * @param string $fieldName The form field name for the file input.
 * @param string $disk The storage disk (e.g., 'local', 's3').
 * @param string $directory The subdirectory within the disk.
 * @param string $rules Validation rules (e.g., 'image:2048|mimes:jpeg,png,jpg,gif,webp,bmp,tiff,jxl,heic,heif,avif').
 * @return string|null New filename, or null if no file uploaded.
 */
protected function handleFileUpload(
	Request $request,
	string $fieldName,
	string $disk = 'local',
	string $directory = '',
	string $rules = 'image:2048'
): ?string`
				),
				P({ class: 'text-muted-foreground' },
					`Usage in hook methods:`
				),
				CodeBlock(
`// Single file upload — returns new filename or null
$data->coverImage = $this->handleFileUpload(
	$request, 'coverImage', 'local', 'vehicles',
	'image:2048|mimes:jpeg,png,gif,bmp,tiff,webp,jxl,heic,heif,avif'
) ?? $data->coverImage;

// Batch file upload — returns array of metadata objects
$media = $this->handleMediaUpload($request, 'media', 'local', 'forum', 'image:5120');
if (!empty($media))
{
	$data->media = json_encode($media);
}
// Each item: { fileName, originalName, mimeType, size }`
				),
				P({ class: 'text-muted-foreground' },
					`handleFileUpload() returns null when no file is uploaded, making it safe for conditional assignment with ??. handleMediaUpload() returns an array of metadata objects for batch uploads. Use both in modifyAddItem() and modifyUpdateItem() hooks to standardize file handling.`
				)
			]),

			// SyncController
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'SyncController (SSE Base Class)'),
				P({ class: 'text-muted-foreground' },
					`Proto provides a SyncController base class that eliminates SSE/Redis streaming boilerplate. Instead of copy-pasting the content-type header setup and redisEvent() call in every sync endpoint, subclasses define just two methods: getChannel() and handleMessage().`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Post\\Controllers;

use Proto\\Controllers\\SyncController;
use Proto\\Http\\Router\\Request;
use Modules\\Post\\Models\\Post;

class PostSyncController extends SyncController
{
	protected function getChannel(Request $request): string
	{
		$postId = $request->getInt('postId');
		return "post:{$postId}";
	}

	protected function handleMessage(string $channel, array $message, Request $request): array|null|false
	{
		$messageId = $message['id'] ?? null;
		if (!$messageId)
		{
			return null;
		}

		$data = Post::get($messageId);
		return ['merge' => [$data], 'deleted' => []];
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`Methods to implement:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('getChannel(Request $request): string|array — Redis channel name(s) from route params'),
					Li('handleMessage(string $channel, array $message, Request $request): array|null|false — return SSE data, null to skip, false to terminate')
				]),
				P({ class: 'text-muted-foreground mt-2' },
					`Register the route as a GET endpoint:`
				),
				CodeBlock(
`router()->get('post/sync', [PostSyncController::class, 'sync']);`
				)
			]),

			// SyncableTrait
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'SyncableTrait (SSE for ResourceControllers)'),
				P({ class: 'text-muted-foreground' },
					`When an SSE endpoint lives on a ResourceController that also handles CRUD, creating a separate SyncController subclass adds friction. Use SyncableTrait instead to add sync support directly to any existing controller.`
				),
				CodeBlock(
`use Proto\\Controllers\\ResourceController;
use Proto\\Controllers\\Traits\\SyncableTrait;
use Proto\\Http\\Router\\Request;

class NotificationController extends ResourceController
{
	use SyncableTrait;

	protected function getSyncChannel(Request $request): string
	{
		return "user:" . session()->user->id . ":notifications";
	}

	protected function handleSyncMessage(string $channel, array $message, Request $request): ?array
	{
		return ['merge' => $message, 'deleted' => []];
	}
}

// Route registration:
router()
	->get('notification/sync', [NotificationController::class, 'sync'])
	->resource('notification', NotificationController::class);`
				),
				P({ class: 'text-muted-foreground' },
					`Multi-channel support:`
				),
				CodeBlock(
`protected function getSyncChannel(Request $request): string|array
{
	$userId = session()->user->id;
	return ["user:{$userId}:notifications", "global:announcements"];
}`
				),
				P({ class: 'text-muted-foreground' },
					`Methods to implement:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('getSyncChannel(Request $request): string|array — Redis channel name(s)'),
					Li('handleSyncMessage(string $channel, array $message, Request $request): array|null|false — return SSE data, null to skip, false to terminate')
				]),
				P({ class: 'text-muted-foreground mt-2' },
					`Use SyncableTrait when adding SSE to an existing ResourceController. Use SyncController for standalone sync-only endpoints with no CRUD.`
				)
			]),

			// Service Delegation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Service Delegation'),
				P({ class: 'text-muted-foreground' },
					`When controllers need multi-step business logic (creating related records, external API calls, notifications), delegate to a service class instead of putting that logic in the controller. Set the $serviceClass property and the controller auto-instantiates the service and delegates addItem/updateItem/deleteItem to the service's add/update/delete methods when they exist. Audit fields (createdBy, userId, updatedBy, etc.) are automatically injected before delegation.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Community\\Group\\Post\\Controllers;

use Modules\\Community\\Group\\Post\\Auth\\Policies\\GroupPostPolicy;
use Modules\\Community\\Group\\Post\\Models\\GroupPost;
use Modules\\Community\\Group\\Post\\Services\\GroupPostService;
use Proto\\Controllers\\ResourceController;
use Proto\\Http\\Router\\Request;

class GroupPostController extends ResourceController
{
	// Declare service class — auto-instantiated in constructor
	protected ?string $serviceClass = GroupPostService::class;
	protected ?string $policy = GroupPostPolicy::class;

	public function __construct(protected ?string $model = GroupPost::class)
	{
		parent::__construct();
	}

	// addItem() automatically delegates to $this->service->add($data)
	// updateItem() automatically delegates to $this->service->update($data)
	// deleteItem() automatically delegates to $this->service->delete($data)

	// Custom actions still use $this->service directly
	public function like(Request $request): object
	{
		$id = $this->getResourceId($request);
		$userId = session()->user->id;
		$result = $this->service->toggleLike($id, $userId);
		return $this->serviceResponse($result, 'Failed to toggle like');
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`Service methods should return ServiceResult, false, an array/object, or a scalar ID:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Community\\Group\\Post\\Services;

use Common\\Services\\Service;
use Proto\\Services\\ServiceResult;
use Modules\\Community\\Group\\Post\\Models\\GroupPost;

class GroupPostService extends Service
{
	public function add(object $data): ServiceResult
	{
		$post = new GroupPost($data);
		$post->add();
		if (!$post->id)
		{
			return ServiceResult::failure('Failed to create post');
		}

		// Multi-step: create related records, send notifications, etc.
		$this->createDefaultTags($post->id);
		$this->notifyGroupMembers($post);

		return ServiceResult::success(['id' => $post->id]);
	}

	public function update(object $data): ServiceResult
	{
		$post = GroupPost::get($data->id);
		if (!$post)
		{
			return ServiceResult::failure('Post not found');
		}

		$post->merge($data);
		$post->update();

		return ServiceResult::success(['id' => $post->id]);
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`The serviceResponse() method is available for custom public methods that call the service. It handles different return types:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('ServiceResult → auto-handles success/error'),
					Li('false → returns the default error message'),
					Li('array/object → wraps in success response'),
					Li('Scalar (e.g., ID) → wraps as { id: result }')
				]),
				P({ class: 'text-muted-foreground mt-2' },
					`Override initializeService() if the service needs constructor arguments:`
				),
				CodeBlock(
`protected function initializeService(): void
{
	$this->service = new GroupPostService($this->someDependency);
}`
				),
				P({ class: 'text-muted-foreground font-semibold' },
					`CRITICAL: Service add/update/delete methods receive data with audit fields already injected. Only define the service methods you need — missing methods fall back to default model behavior. Use the $serviceClass property instead of manual instantiation in the constructor.`
				)
			]),

			// Location / Proximity Filtering
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Location / Proximity Filtering (LocationFilterTrait)'),
				P({ class: 'text-muted-foreground' },
					`Use LocationFilterTrait in services that need to filter records by geographic proximity. It builds ST_Distance_Sphere conditions compatible with Proto's filter array pattern so callers never write raw SQL distance expressions.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Vehicle\\Services;

use Common\\Services\\Service;
use Proto\\Services\\Traits\\LocationFilterTrait;
use Modules\\User\\Main\\Models\\UserLocationPreference;

class VehicleService extends Service
{
	use LocationFilterTrait;

	// Direct filter on the queried table's POINT column
	public function addLocationFilter(float $lat, float $lon, array &$filter): void
	{
		$this->filterByProximity($filter, [
			'latitude' => $lat,
			'longitude' => $lon,
			'radius' => 50,          // miles (default)
			'alias' => 'v',          // table alias
			'column' => 'position',  // POINT column (default)
		]);
	}

	// Subquery filter against a related table
	public function addUserLocationFilter(int $userId, array &$filter): void
	{
		$userLocation = UserLocationPreference::getBy(['userId' => $userId]);
		if (!$userLocation || empty($userLocation->longitude) || empty($userLocation->latitude))
		{
			return;
		}

		$this->filterByProximitySubquery($filter, [
			'latitude' => $userLocation->latitude,
			'longitude' => $userLocation->longitude,
			'radius' => $userLocation->radiusMiles ?? 50,
			'table' => 'user_location_preferences',
			'joinColumn' => 'user_id',
			'parentColumn' => 'v.user_id',
		]);
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`Available methods:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('filterByProximity(array &$filter, array $options) — appends a direct proximity condition on a POINT column'),
					Li('filterByProximitySubquery(array &$filter, array $options) — appends an EXISTS subquery proximity condition against a related table'),
					Li('buildProximityCondition(array $options) — returns a standalone [sql, params] condition without appending'),
					Li('buildProximitySubqueryCondition(array $options) — returns a standalone subquery condition'),
					Li('convertToMeters(float|int $radius, string $unit) — utility to convert radius to meters (miles or km)')
				]),
				P({ class: 'text-muted-foreground mt-2' },
					`Options: latitude, longitude, radius (default 50), unit ('miles'|'km'), column (default 'position'), alias (table alias for direct), table/joinColumn/parentColumn/tableAlias (for subquery variant).`
				)
			])
		]
	);

export default ControllersPage;