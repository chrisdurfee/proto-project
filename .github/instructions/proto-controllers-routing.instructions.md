---
description: "Use when working with Proto Framework controllers, routing, modules, gateways, or API endpoints - covers Module activate(), nested feature modules with Main/, gateway pattern, fluent routing (resource last), CSRF mutation middleware, ResourceController properties (routeParams, filterParams, scopeToUser, enrichUserFields, serviceClass, maxLimit), getAllInputs() contract for list endpoints, BatchEnrichmentTrait, serviceResponse(), file upload helpers, and SyncableTrait for SSE"
applyTo: "{modules/**/Controllers/*.php,modules/**/Api/*.php,modules/**/*Module.php}"
---

# Proto Controllers & Routing

## Modules

**Location**: `modules/YourModule/YourModuleModule.php`

```php
<?php declare(strict_types=1);
namespace Modules\YourModule;

use Proto\Module\Module;

class YourModuleModule extends Module
{
    public function activate(): void
    {
        // Setup code
    }
}
```

**CRITICAL**:
- Extend `Proto\Module\Module` (singular, NOT `Proto\Modules\Module`)
- Use `activate()` NOT `boot()`
- Routes automatically loaded from `modules/*/Api/api.php`

## Nested Feature Modules

Proto supports nested feature modules for organizing large modules:
```
modules/Community/
  CommunityModule.php
  Main/Api/api.php              # /api/community
  Group/Api/api.php             # /api/community/group
  Group/Api/Settings/api.php    # /api/community/group/settings
  Events/Api/api.php            # /api/community/events
  Gateway/Gateway.php           # Parent gateway with feature access
```

Use a `Main/` folder when a module needs both root-level routes AND nested features.

**URL Resolution Order**:
1. Nested Feature: `modules/{Seg1}/{Seg2}/Api/{Seg3...}/api.php`
2. Nested Feature with Main: `modules/{Seg1}/{Seg2}/Main/Api/{Seg3...}/api.php`
3. Flat Module: `modules/{Seg1}/Api/{Seg2...}/api.php`
4. Main Folder Fallback: `modules/{Seg1}/Main/Api/{Seg2...}/api.php`

**Gateway Pattern**:
```php
// modules/User/Gateway/Gateway.php
class Gateway
{
    // Main methods directly on gateway — NO main() accessor
    public function get(mixed $id): ?User
    {
        return User::get($id);
    }

    // Nested features via accessor methods
    public function follower(): FollowerGateway
    {
        return new FollowerGateway();
    }
}

// Usage:
modules()->user()->get($userId);              // Main methods directly
modules()->user()->follower()->follow($id);   // Nested via accessor
// ❌ WRONG: modules()->user()->main()->get($userId);
```

**When to Use Nested Features**: Module has 3+ distinct sub-domains, features are self-contained with own Controllers/Models/Services.

## Routing

**Location**: `modules/YourModule/Api/api.php`

```php
use Modules\User\Controllers\UserController;
router()->resource('user', UserController::class);
router()->get('user/stats', [UserController::class, 'stats']);

router()->group('auth/crm', function(Router $router)
{
    $router->post('login', [AuthController::class, 'login']);
});
```

**Fluent chaining** — resource route MUST be last:
```php
router()
    ->get('garage/portfolio', [GarageController::class, 'portfolio'])
    ->post('garage/reorder', [GarageController::class, 'reorder'])
    ->resource('garage', GarageController::class);
```

**Middleware**:
```php
router()
    ->middleware([CrossSiteProtectionMiddleware::class]) // applies to all routes after this line

    ->get('user/account', [UserController::class, 'account'],
    [ApiRateLimiterMiddleware::class]); // route-level middleware
```

**Default Mutation Middleware**: CSRF protection is enabled by default on all POST/PUT/PATCH/DELETE routes. No manual setup required.
```php
// Opt out specific routes (webhooks, OAuth)
router()->withoutMutationMiddleware()->post('webhook', [WebhookController::class, 'handle']);
```

**CRITICAL**:
- Module routes MUST start with module name
- Controller methods: ALWAYS wrap in array `[Controller::class, 'method']`
- Resource route adds `id` param automatically: `resource('user', ...)` → `/user/:id?`
- Controllers should use Auth Policies — NOT check auth directly

### One api.php per request — sibling Api/ folders are NOT auto-loaded

Proto resolves the URL to **a single** `api.php` file (see resolution order above) and `require`s only that file. Sibling feature folders like `modules/Marketplace/Browse/Api/api.php` are **never loaded** for `/api/marketplace/recommended` — that URL resolves to `modules/Marketplace/Api/api.php` (or its `Main/Api/` fallback). If routes live in a sibling file that the URL doesn't resolve to, the resource catch-all (`marketplace/:id?`) swallows the request and dispatches to `get($id)` → "The ID is required to get the item."

**Rules**:
- All sub-routes that share a URL prefix with a resource MUST live in the **same** `api.php` as the resource — and MUST be registered **before** the `->resource(...)` call (which adds the `:id?` catch-all).
- Use nested feature folders (`modules/Parent/Child/Api/api.php`) only when the URL itself is nested (`/api/parent/child/...`). For `/api/marketplace/recommended`, "recommended" is NOT a feature folder — it's a sub-route on the marketplace resource and belongs in `modules/Marketplace/Api/api.php`.
- Symptom of this bug: a GET to a "list-style" endpoint returns `{success: false, message: "The ID is required to get the item."}` with HTTP 200. That is `ResourceController::get()` rejecting the literal word as an `id`.

## Controllers

**Base Classes**:
- `Proto\Controllers\ResourceController` — CRUD with hooks, default add/update/delete/get/all/search
- `Proto\Controllers\ApiController` — custom endpoints, base for all controllers
- `Proto\Controllers\SyncController` — SSE/Redis streaming

**Query Limit Cap**: All controllers inherit `$maxLimit` (default 1000). `getAllInputs()` caps the `limit` param to this value. Override per-controller:
```php
protected int $maxLimit = 2000; // Allow larger result sets
```

```php
use Modules\User\Main\Auth\Policies\UserPolicy;

class UserController extends ResourceController
{
    protected ?string $policy = UserPolicy::class;

    public function __construct(protected ?string $model = User::class)
    {
        parent::__construct();
    }

    protected function validate(): array
    {
        return [
            'name' => 'string:255|required',
            'email' => 'email|required',
        ];
    }
}
```

### Declarative Controller Properties

```php
// Auto-inject route params and filter on all()
protected array $routeParams = ['forumId' => true]; // true = required, false = optional

// Auto-apply query string filters
protected array $filterParams = ['topicId' => 'int']; // maps param name to type

// Auto-scope resources to authenticated user
protected bool $scopeToUser = true;
protected string $userScopeField = 'hostId'; // default: 'userId'

// Auto-attach session user fields to add/update responses
protected array $enrichUserFields = ['firstName', 'lastName', 'image', 'username', 'verified'];

// Service delegation — auto-instantiated, delegates addItem/updateItem/deleteItem
protected ?string $serviceClass = GroupPostService::class;
```

### Method Signatures

**Public Methods** (receive `Request $request`):
- `add(Request $request)`, `update(Request $request)`, `delete(Request $request)`
- `get(Request $request)`, `all(Request $request)`, `search(Request $request)`

**Protected Methods** (NO Request parameter):
- `addItem(object $data)`, `updateItem(object $data)`, `deleteItem(object $data)`
- These auto-inject audit fields (userId, createdBy, updatedBy, etc.) if the model has them

**Hook Methods** (modify data before persistence):
- `modifyAddItem(object &$data, Request $request)` — called BEFORE addItem()
- `modifyUpdateItem(object &$data, Request $request)` — called BEFORE updateItem()
- `modifyFilter(?object $filter, Request $request)` — customize all() filter

**Enrichment Hooks** (post-fetch decoration):
- `enrichRows(array &$rows, Request $request)` — batch-enrich after all()
- `enrichRow(object &$row, Request $request)` — auto-delegates to enrichRows()

### Request Parameters

```php
// Query/body parameters
$name = $request->input('name');
$limit = $request->getInt('limit');
$isActive = $request->getBool('active');
$data = $request->json('item');

// Route parameters from URL path (e.g., /communities/:communityId/groups)
$params = $request->params();
$communityId = (int)($params->communityId ?? 0);

// ❌ WRONG - route() doesn't exist, getInt reads query/body NOT route params
$communityId = $request->route('communityId');
$communityId = $request->getInt('communityId'); // Won't find route param
```

### Hook Method Patterns

```php
use Proto\Utils\Strings;

// Standard modifyAddItem — inject audit fields
protected function modifyAddItem(object &$data, Request $request): void
{
    parent::modifyAddItem($data, $request); // handles scopeToUser + routeParams
    $data->createdBy = session()->user->id;
}

// Standard modifyUpdateItem — framework auto-strips $immutableFields
protected function modifyUpdateItem(object &$data, Request $request): void
{
    $data->updatedBy = (int)session()->user->id;
}

// Custom filter logic
protected function modifyFilter(?object $filter, Request $request): ?object
{
    $clientId = $request->getInt('clientId');
    if ($clientId)
    {
        $filter->clientId = (int)$clientId;
    }
    return $filter;
}
```

**When to Use Each Pattern**:
1. **Hook methods** (`modifyAddItem`, `modifyUpdateItem`) — inject route params, sanitize data, set defaults, audit fields
2. **Override public methods** (`add`, `update`) — complex validation, custom services, multi-DB operations
3. **Override protected methods** (`addItem`, `updateItem`) — customizing persistence itself
4. **Enrichment hooks** (`enrichRows`) — appending computed flags (isFavorited, isBookmarked, isFollowing)

### List Endpoints MUST Use getAllInputs() (CRITICAL)

```php
public function myListEndpoint(Request $request): object
{
    $inputs = $this->getAllInputs($request);
    $filter = [['v.is_public', 1]];
    $result = Model::all($filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
    return $this->response($result);
}
```

Never hardcode limit/offset/modifiers — it breaks pagination, sorting, and searching.

**Merging default modifiers** (when you need a server-side default):
```php
$inputs = $this->getAllInputs($request);
if (empty($inputs->modifiers['orderBy']))
{
    $inputs->modifiers['orderBy'] = 'v.created_at DESC';
}
$result = Model::all($filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
```

### Enrichment with BatchEnrichmentTrait

```php
use Proto\Controllers\Traits\BatchEnrichmentTrait;

class VehicleController extends ResourceController
{
    use BatchEnrichmentTrait;

    protected function enrichRows(array &$rows, Request $request): void
    {
        $userId = session()->user->id ?? null;
        if (!$userId || empty($rows)) return;

        $this->batchMapExists($rows, UserFavoriteVehicle::class, 'vehicleId', 'isFavorited', [['userId', $userId]]);
        $this->batchMapExists($rows, Bookmark::class, 'itemId', 'isBookmarked', [['userId', $userId], ['itemType', 'vehicle']]);
        $this->batchMapField($rows, ForumTopic::class, 'id', 'name', 'topicName', '', [], 'topicId');
    }
}
```

`batchMapField($rows, $modelClass, $foreignKey, $valueField, $targetField, $default, $extraFilter, $sourceKey)` — maps a value from related records
`batchMapExists($rows, $modelClass, $foreignKey, $targetField, $extraFilter, $sourceKey)` — boolean existence check

### Service Delegation

```php
class GroupPostController extends ResourceController
{
    protected ?string $serviceClass = GroupPostService::class;
    protected ?string $policy = GroupPostPolicy::class;

    public function __construct(protected ?string $model = GroupPost::class)
    {
        parent::__construct();
    }

    // addItem() auto-delegates to $this->service->add($data)
    // updateItem() auto-delegates to $this->service->update($data)

    public function like(Request $request): object
    {
        $id = $this->getResourceId($request);
        $userId = session()->user->id;
        $result = $this->service->toggleLike($id, $userId);
        return $this->serviceResponse($result, 'Failed to toggle like');
    }
}
```

`serviceResponse()` handles: `ServiceResult` → auto success/error, `false` → error message, `array`/`object` → success, scalar → `['id' => $result]`

Override `initializeService()` if service needs constructor args.

### File Uploads in Controllers

```php
// Single file — returns filename or null
$data->coverImage = $this->handleFileUpload($request, 'coverImage', 'local', 'vehicles', 'image:2048|mimes:jpeg,png,gif,bmp,tiff,webp,jxl,heic,heif,avif') ?? $data->coverImage;

// Batch — returns array of metadata objects {fileName, originalName, mimeType, size}
$media = $this->handleMediaUpload($request, 'media', 'local', 'forum', 'image:5120');
```

### SyncableTrait (SSE on ResourceControllers)

```php
use Proto\Controllers\Traits\SyncableTrait;

class NotificationController extends ResourceController
{
    use SyncableTrait;

    protected function getSyncChannel(Request $request): string|array
    {
        return "user:" . session()->user->id . ":notifications";
    }

    protected function handleSyncMessage(string $channel, array $message, Request $request): array|null|false
    {
        return ['merge' => $message, 'deleted' => []];
    }
}

// Route: router()->get('notification/sync', [NotificationController::class, 'sync'])
```

Use **SyncableTrait** when SSE is on an existing ResourceController. Use **SyncController** for standalone sync-only endpoints.

### Error Handling

- `$this->setError('message')` in hook methods — halts execution (return type `never`)
- `$this->error('message')` in public methods — returns error response
- NEVER throw exceptions in controllers
- NEVER place code after `setError()` — it won't run

### CRITICAL Rules
- Controllers NEVER access storage classes directly — use model methods
- Every ResourceController MUST have `protected ?string $policy`
- Policies handle authentication — controllers assume user is authenticated
- After policy check, `session()->user->id` is safe to use without null check
- Use `$routeParams` / `$filterParams` to eliminate most hook overrides
- Only implement `enrichRows()` — `enrichRow()` auto-delegates
- NEVER override `get()`/`all()` just to append flags — use enrichment hooks
