# Copilot Instructions

**Goal**: Enable AI agents to build resilient, scalable, maintainable, and secure code with minimal errors and without human intervention.

## 1. Project Overview & Architecture
We strive to maintain high code quality and consistency. The code should be resilient, scalable, maintainable, and secure. Functions and methods should adhere to single responsibility principle, and classes should follow SOLID principles. fail gracefully with proper error handling and logging.

### Stack
- **Backend**: PHP 8.4 monolith using **Proto Framework**. Entry: `public/api/index.php`.
- **Frontend**: Vite-based apps in `apps/{crm,developer,main}` using **Base Framework** (fundamentally different from React/Vue).
- **Infrastructure**: Dockerized (Web/PHP, MariaDB, Redis) via `infrastructure/docker-compose.yaml`.

### Code Layout
- `modules/*`: Feature modules (domain logic).
- `common/*`: Shared framework glue, base classes, configs.
- `public/*`: HTTP entrypoints and assets.
- `apps/*`: Independent frontend applications proxying to backend.

### Autoloading
- PSR-4: `Modules\` → `modules/`, `Common\` → `common/`.
- Migrations: classmapped from `common/Migrations` and `modules/*/Migrations`.

## 2. Critical Workflows

### Setup
1. Copy `common/Config/.env-example` → `common/Config/.env`.
2. Run `./infrastructure/scripts/run.sh sync-config` (generates root `.env` for Docker).

### Run Services
```bash
docker-compose -f infrastructure/docker-compose.yaml up -d
```
- **Logs**: `docker-compose -f infrastructure/docker-compose.yaml logs -f web`
- **Shell**: `docker-compose -f infrastructure/docker-compose.yaml exec web bash`

### Migrations
- **Auto-run**: Enabled by default (`AUTO_MIGRATE=true`).
- **Manual**: `docker-compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php`

### Frontend Development
- Navigate to app: `cd apps/{crm,developer,main}`
- Install: `npm install`
- Dev server: `npm run dev` (ports 3000/3001/3002; `/api` proxied to container at 8080)

### Testing
- **Run all**: `php vendor/bin/phpunit`
- **Suite**: `php vendor/bin/phpunit --testsuite Feature`
- **Filter**: `php vendor/bin/phpunit --filter TestName`
- **Readable output**: `php vendor/bin/phpunit --testdox`
- Tests auto-wrap in transactions; changes rollback automatically.

### Factories
- **Location**: `modules/*/Factories` or `common/Factories`
- **Purpose**: Generate test data for models using the Proto Simple Faker class. Check Proto composer package in `\src\Tests\SimpleFaker.php` for available methods.
- **Usage**:
```php
// Create and persist
$user = User::factory()->create();

// Create without persisting
$user = User::factory()->make();

// Create multiple
$users = User::factory()->count(5)->create();

// With custom attributes
$user = User::factory()->create(['email' => 'test@example.com']);

// States for variations
$admin = User::factory()->admin()->create();
```

**Factory Structure**:
```php
<?php declare(strict_types=1);
namespace Modules\User\Factories;

use Proto\Models\Factory;
use Modules\User\Models\User;

class UserFactory extends Factory
{
    protected static ?string $model = User::class;

    protected function definition(): array
    {
        return [
            'username' => $this->faker->userName(),
            'email' => $this->faker->email(),
            'password' => password_hash('password', PASSWORD_DEFAULT),
            'firstName' => $this->faker->firstName(),
            'lastName' => $this->faker->lastName()
        ];
    }

    // State methods
    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }
}
```

### Seeders
- **Location**: `modules/*/Seeders` or `common/Seeders`
- **Purpose**: Populate database with initial/test data
- **Run**: `php vendor/bin/phpunit --filter SeederTest` or programmatically
- **Usage**:
```php
// In tests or setup scripts
$seeder = new UserSeeder();
$seeder->run();

// Via SeederManager
SeederManager::run([UserSeeder::class, GroupSeeder::class]);
```

**Seeder Structure**:
```php
<?php declare(strict_types=1);
namespace Modules\User\Seeders;

use Proto\Database\Seeders\Seeder;
use Modules\User\Factories\UserFactory;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Using factories
        User::factory()->count(10)->create();

        // Or direct creation
        User::create((object)[
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => password_hash('admin123', PASSWORD_DEFAULT)
        ]);
    }
}
```

### File Storage (Vault)
- **Location**: `Proto\Utils\Files\Vault`
- **Config**: `common/Config/.env` under `"files"` key
- **Purpose**: Handle file uploads, storage, retrieval, and deletion
- **Drivers**: `local`, `s3`

**Configuration Example**:
```json
"files": {
    "local": {
        "path": "/common/files/",
        "attachments": {
            "path": "/common/files/attachments/"
        }
    },
    "amazon": {
        "s3": {
            "bucket": {
                "uploads": {
                    "secure": true,
                    "name": "main",
                    "path": "main/",
                    "region": "",
                    "version": "latest"
                }
            }
        }
    }
}
```

**Usage**:
```php
use Proto\Utils\Files\Vault;

// In controller - store uploaded file
$uploadFile = $this->file('upload');
$uploadFile->store('local', 'attachments');

// Or via Vault directly
Vault::disk('local', 'attachments')->add('/tmp/file.txt');

// Download file
Vault::disk('local', 'attachments')->download('file.txt');

// Get file
$content = Vault::disk('local')->get('/tmp/file.txt');

// Delete file
Vault::disk('local')->delete('/tmp/file.txt');

// S3 usage
Vault::disk('s3', 'uploads')->add('/tmp/file.txt');
Vault::disk('s3')->delete('/tmp/file.txt');
```

## 3. Backend Development (Proto Framework)

### Code Style (CRITICAL)
Always use doc blocks for classes, properties, members, functions, types, and methods.

#### Strict Types
**ALWAYS** declare strict types:
```php
<?php declare(strict_types=1);
```

#### Braces
**Opening braces ALWAYS on new line** (methods, classes, if/else, loops):
```php
// ✅ CORRECT
public function getUserCars(int $userId): array
{
    return CarProfile::fetchWhere(['userId' => $userId]);
}

if ($condition)
{
    // code
}

// ❌ WRONG
public function getUserCars(int $userId): array {
    return CarProfile::fetchWhere(['userId' => $userId]);
}
```

### References
Use the "use" statement for class references, NOT fully qualified names inline.

```php
// ✅ CORRECT
use Modules\User\Models\User;

$user = User::get($userId);

// ❌ WRONG
$user = \Modules\User\Models\User::get($userId);
```

#### Spacing
use tabs for indentation, 4 spaces for alignment.

**NO blank lines** between variable assignment and immediate condition check:
```php
// ✅ CORRECT
$carProfile = CarProfile::get($carProfileId);
if (!$carProfile)
{
    return false;
}

// ❌ WRONG
$carProfile = CarProfile::get($carProfileId);

if (!$carProfile)
{
    return false;
}
```

### Modules

**Location**: `modules/YourModule/YourModuleModule.php`

**Structure**:
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
- Use `activate()` method NOT `boot()`
- Routes automatically loaded from `modules/*/Api/api.php`

### Routing

**Location**: `modules/YourModule/Api/api.php`

The Proto ApiRouter will automatically add an `id` parameter at the end of the path for item-specific actions using a resource route.
```php
use Modules\User\Controllers\UserController;
// in Modules/User/Api/api.php
// path: /user/:id?
router()->resource('user', UserController::class);

// in Modules/User/Api/Address/api.php
// path: /user/:userId/address/:id?
router()->resource('user/:userId/address', AddressController::class);
```

**Patterns**:
```php
// Resource routes
use Modules\User\Controllers\UserController;
router()->resource('user', UserController::class);

// Custom routes (use array callable)
router()->get('user/stats', [UserController::class, 'stats']);

// Fluent chaining
router()
    ->get('garage/portfolio', [GarageController::class, 'portfolio'])
    ->post('garage/reorder', [GarageController::class, 'reorder'])
    ->resource('garage', GarageController::class); // The resource route must be last to allow other routes to take precedence

// Groups
router()->group('auth/crm', function(Router $router)
{
    $router->post('login', [AuthController::class, 'login']);
    $router->post('mfa/verify', [AuthController::class, 'verifyAuthCode']);
});
```

**CRITICAL**:
- Module routes MUST start with module name: `'garage/...'` NOT `'user/:id/garage/...'`
- Controller methods: ALWAYS wrap in array `[Controller::class, 'method']`
- Use fluent interface for chaining

### Controllers

**Base Classes**:
- `Proto\Controllers\ResourceController` (CRUD)
- `Proto\Controllers\ApiController` (custom endpoints)

**Example**:
```php
class UserController extends ResourceController
{
    public function __construct(protected ?string $model = User::class)
    {
        parent::__construct();
    }

    protected function validate(): array
    {
        return [
            'name' => 'string:255|required',
            'email' => 'email|required'
        ];
    }
}
```
***Route Requests***:
Controllers receive `use Proto\Http\Router\Request` objects in public methods and hook methods.

***Exceptions**:
Do not throw exceptions in controllers. Use `$this->setError('message')` in hook methods or `$this->error('message')` in public methods to fail gracefully.
```php
// ✅ CORRECT - Graceful error handling in hook
protected function modifiyUpdateItem(object &$data, Request $request): void
{
    $post = GroupPost::get($data->id);
    if (!$post)
    {
        $this->setError('Post not found');
        return;
    }

    $userId = session()->user->id;
    if ($post->userId !== (int)$userId)
    {
        $this->setError('Unauthorized');
        return;
    }
}

// ✅ CORRECT - Graceful error handling in public method
public function customAction(Request $request): object
{
    $id = $request->getInt('id');
    if (!$id)
    {
        return $this->error('ID required');
    }
    // ...
}

// ❌ WRONG - Throwing exceptions
protected function modifiyUpdateItem(object &$data, Request $request): void
{
    if (!$post)
    {
        throw new \Exception('Post not found');
    }
}
```

**Session Access**:
The api router sets up global session access:
```php
// get user from session
$user = session()->user ?? null;
$userId = session()->user->id ?? null;

//or
getSession('user');

// set session value
setSession('key', 'value');
```

**CRITICAL Authentication Pattern**:
- **Policies handle authentication** - Use `protected ?string $policy = YourPolicy::class;` in controllers
- **Controllers assume user authenticated** - After policy check, `session()->user->id` is available
- **DO NOT check auth in controllers** - No `if (!$userId)` checks needed
- **Use session data directly** - `$userId = session()->user->id;` (no null check)

```php
// ✅ CORRECT - Policy enforces auth, controller uses session
class GroupController extends ResourceController
{
    protected ?string $policy = GroupPolicy::class;

    public function join(Request $request): object
    {
        $groupId = $request->getInt('groupId');
        $userId = session()->user->id; // Safe after policy check

        return $this->service->joinGroup($userId, $groupId);
    }
}

// ❌ WRONG - Don't check auth in controller
public function join(Request $request): object
{
    $userId = session()->user->id ?? null;
    if (!$userId)
    {
        return $this->error('User not authenticated');
    }
    // ...
}
```

Controllers can access the session to inject user data into add/update operations using hook methods.


**CRITICAL**:
- Controllers NEVER access storage classes directly
- Always use model methods: `$car = CarProfile::get($id)` NOT `$storage->get($id)`
- Use validation: `$this->validateRules($data, [...])` or `$request->validate([...])`

The validate method is called by the default add or update methods in the ResrouceController to validate the data before passing it to the protected addItem or updateItem methods.

#### ResourceController Request Patterns
The resource controller provides default implementations for common CRUD operations.

**CRITICAL: Method Signatures**

**Public Methods** (receive `Request $request` parameter):
- `add(Request $request)` → calls `addItem(object $data)`
- `update(Request $request)` → calls `updateItem(object $data)`
- `delete(Request $request)` → calls `deleteItem(object $data)`
- `get(Request $request)`, `all(Request $request)`, `search(Request $request)`, etc.

The all method is used to list multiple items with optional filtering, sorting, and pagination
and can use cursor for sorting.

it accepts a filter object, optional offset and limit or last cursor and since for pagination, dates object, and optional modifiers for sorting, groupingsearching, and cursor.

This method can reduce the number of custom queries in models needed for listing endpoints.

```php
public function all(Request $request): object
{
    $inputs = $this->getAllInputs($request);
    $result = $this->model::all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
    return $this->response($result);
}
```

**Protected Methods** (NO Request parameter):
- `addItem(object $data)` - performs the actual add operation
- `updateItem(object $data)` - performs the actual update operation
- `deleteItem(object $data)` - performs the actual delete operation

**Hook Methods** (receive `Request $request` parameter):
- `modifiyAddItem(object &$data, Request $request)` - called BEFORE `addItem()`, modifies data by reference
- `modifiyUpdateItem(object &$data, Request $request)` - called BEFORE `updateItem()`, modifies data by reference
- `modifyFilter(?object $filter, Request $request)` - called in `all()` to customize filter

**Access Route Parameters**:
Use Request object methods to access route parameters. Available methods:
- `input($key)` - Get string parameter
- `getInt($key)` - Get integer parameter
- `getBool($key)` - Get boolean parameter
- `json($key)` - Get JSON parameter
- `raw($key)` - Get raw parameter

**CRITICAL**: `route()` method does NOT exist. Use the methods above.

```php
// ✅ CORRECT
$communityId = $request->getInt('communityId');
$name = $request->input('name');
$isActive = $request->getBool('active');

// ❌ WRONG - route() doesn't exist
$communityId = $request->route('communityId');
```
**Params in the url**
The route parameters are available in the request object using the params method. This will return an object with the route parameters as properties.

```php
// ✅ CORRECT
// path /communities/:communityId/groups
$params = $request->params();
$communityId = (int)($params->communityId ?? 0);

// ❌ WRONG - route() doesn't exist
$communityId = $request->route('communityId');
```

```php
// ❌ WRONG - Accessing request in protected method like addItem()
protected function addItem(object $data): object
{
    $communityId = $this->request->input('communityId'); // request not available
    // ...
}

// ✅ CORRECT Option 1: Use hook method which is preferred as this allows the defaluts to do their work
protected function modifiyAddItem(object &$data, Request $request): void
{
    $communityId = $request->getInt('communityId');
    if (!$communityId)
    {
        $this->setError('Community ID required');
        return;
    }
    $data->communityId = (int)$communityId;
}

// ✅ CORRECT Option 2: Override public method, good but the default methods do a lot of work
public function add(Request $request): object
{
    $communityId = $request->getInt('communityId');
    if (!$communityId)
    {
        return $this->error('Community ID required');
    }

    $data = $this->getRequestItem($request);
    if (empty($data))
    {
        return $this->error('No item provided.');
    }

    $data->communityId = (int)$communityId;
    $this->modifiyAddItem($data, $request);
    if (!$this->validateItem($data, false))
    {
        return $this->error('Invalid item data.');
    }

    return $this->addItem($data);
}

// ✅ CORRECT Option 3: Create custom endpoint
public function create(Request $request): object
{
    $communityId = $request->getInt('communityId');
    if (!$communityId)
    {
        return $this->error('Community ID required');
    }

    $userId = session()->user->id ?? null;

    $data = $this->getRequestItem($request);
    $group = $this->service->createGroup(
        (int)$userId,
        (int)$communityId,
        $data
    );

    if (!$group)
    {
        return $this->error('Failed to create group');
    }

    return $this->response($group);
}
```

**Hook Method Examples**:

```php
// Add route parameter to data
protected function modifiyAddItem(object &$data, Request $request): void
{
    $clientId = $request->getInt('clientId');
    if ($clientId)
    {
        $data->clientId = $clientId;
    }

    // Sanitize content
    if (isset($data->content))
    {
        $data->content = trim(html_entity_decode($data->content, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }
}

// Restrict fields that shouldn't be modified
protected function modifiyUpdateItem(object &$data, Request $request): void
{
    $id = $data->id ?? null;
    $restrictedFields = ['id', 'clientId', 'createdAt', 'createdBy'];
    $this->restrictFields($data, $restrictedFields);
    $data->id = $id; // Restore ID after restriction
}

// Modify filter for all() queries
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

1. **Use hook methods** (`modifiyAddItem`, `modifiyUpdateItem`) when:
   - Injecting route parameters into data
   - Sanitizing/transforming input data
   - Setting default values
   - Restricting fields

2. **Override public methods** (`add`, `update`) when:
   - Need complex validation based on route parameters
   - Need to call services with custom logic
   - Need to return custom responses
   - Need multiple DB operations

3. **Override protected methods** (`addItem`, `updateItem`) when:
   - Customizing the persistence logic itself
   - Adding post-persistence operations
   - NOT for accessing request data (use hooks instead)

### Models

**Base**: `Proto\Models\Model`

**Static Methods** (operate on class):
- `create((object)$data)` - returns BOOL
- `get($id)` - returns object|null
- `remove($id)` - returns bool
- `fetchWhere([...])` - returns array

**Instance Methods** (operate on object):
- `add()` - persists new instance
- `update()` - updates existing
- `delete()` - removes instance

**Configuration**:
```php
class User extends Model
{
    protected static ?string $tableName = 'users';
    protected static array $fields = ['id', 'name', 'email', 'status'];
    protected static array $fieldsBlacklist = ['password']; // Exclude from JSON output
    protected static string $idKeyName = 'id'; // Default, only set if different

    // Pre-persist hook - sanitize/transform before save
    protected static function augment(mixed $data = null): mixed
    {
        if ($data && isset($data->email))
        {
            $data->email = strtolower(trim($data->email));
        }
        return $data;
    }

    // Post-fetch hook - shape API output
    protected static function format(?object $data): ?object
    {
        if ($data)
        {
            $data->displayName = $data->firstName . ' ' . $data->lastName;
        }
        return $data;
    }
}
```

### Model Relationships: Eager vs Lazy

Proto supports two distinct approaches to relating models:

**1. Eager Joins (JoinBuilder)** - Loaded in single query via SQL JOIN
**2. Lazy Relationships** - Loaded on-demand via separate queries

#### Eager Joins (JoinBuilder)

**WHEN TO USE**: When you ALWAYS need related data and want to avoid N+1 queries.

**Define in `joins()` method** using JoinBuilder API:

```php
protected static function joins(object $builder): void
{
    // One-to-one join
    Role::one($builder)
        ->on(['id', 'userId'])  // [parent_key, foreign_key]
        ->fields('role');  // Fields to select from roles table

    // One-to-many through bridge table
    UserRole::bridge($builder)
        ->many(Role::class)
        ->on(['roleId', 'id'])
        ->fields('id', 'name', 'slug', 'description', 'permissions');

    // belongsTo (inverse one-to-one)
    $builder->belongsTo(Organization::class, fields: ['name', 'slug']);

    // Raw table join
    $builder->left('permission', 'p')
        ->on(['id', 'permissionId'])
        ->fields('name');
}
```

**BelongsToMany Chaining Pattern**:
For complex many-to-many relationships, chain `belongsToMany` calls:

```php
protected static function joins(object $builder): void
{
    // Chain 1: User → Roles → Permissions
    // Joins user_roles, then roles, then permission_roles, then permissions
    $builder
        ->belongsToMany(Role::class, pivotFields: ['organizationId'])
        ->belongsToMany(Permission::class);

    // Chain 2: User → Organizations
    // Joins organization_users, then organizations
    $builder
        ->belongsToMany(Organization::class, ['id', 'name']);
}
```

**Key Points**:
- `on()` takes `[parent_key, foreign_key]` order
- `fields()` specifies which columns to select from related table
- EXCLUDE 'id' from `fields()` in `belongsTo` to avoid conflicts
- Use named parameters: `fields: ['name']` NOT positional
- Chained `belongsToMany` automatically handles pivot tables

#### Lazy Relationships

**WHEN TO USE**: When related data is optional or conditionally needed.

**Define as methods** returning relation objects:

```php
class User extends Model
{
    // One-to-many: User has many posts
    public function posts(): \Proto\Models\Relations\HasMany
    {
        return $this->hasMany(Post::class);
    }

    // One-to-one: User has one profile
    public function profile(): \Proto\Models\Relations\HasOne
    {
        return $this->hasOne(Profile::class);
    }

    // Many-to-many: User has many roles through user_roles pivot
    public function roles(): \Proto\Models\Relations\BelongsToMany
    {
        // Params: related model, pivot table, foreign pivot key, related pivot key, parent key, related key
        return $this->belongsToMany(
            Role::class,
            'user_roles',  // pivot table (optional, auto-inferred)
            'user_id',     // foreign key in pivot (optional)
            'role_id',     // related key in pivot (optional)
            'id',          // parent key (optional)
            'id'           // related key (optional)
        );
    }
}

class Post extends Model
{
    // Belongs-to (inverse): Post belongs to user
    public function user(): \Proto\Models\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

**Usage**:
```php
// Eager join: All data in one query
$user = User::get(1); // Includes eager-joined roles automatically

// Lazy load: Separate queries fired on access
$user = User::get(1);
$posts = $user->posts;     // SELECT * FROM posts WHERE user_id = 1
$profile = $user->profile; // SELECT * FROM profiles WHERE user_id = 1
$roles = $user->roles;     // SELECT * FROM roles r INNER JOIN user_roles p...
```

**BelongsToMany Helper Methods**:
```php
// Attach role to user (add pivot record)
$user->roles()->attach(3);

// Detach role from user (remove pivot record)
$user->roles()->detach(3);

// Sync roles (remove non-matching, add missing)
$user->roles()->sync([2, 4, 5]);

// Toggle roles (attach if missing, detach if present)
$user->roles()->toggle([2, 6]);
```

#### Combining Both Approaches

You can use BOTH eager and lazy relationships in the same model:

```php
class User extends Model
{
    // Eager join for organization (always needed)
    protected static function joins(object $builder): void
    {
        $builder->belongsTo(Organization::class, fields: ['name', 'slug']);
    }

    // Lazy relationship for posts (conditionally needed)
    public function posts(): \Proto\Models\Relations\HasMany
    {
        return $this->hasMany(Post::class);
    }

    // Lazy relationship for profile (conditionally needed)
    public function profile(): \Proto\Models\Relations\HasOne
    {
        return $this->hasOne(Profile::class);
    }
}
```

#### Common Errors to Avoid

```php
// ❌ WRONG - Including 'id' in belongsTo fields causes conflicts
$builder->belongsTo(Organization::class, fields: ['id', 'name']);

// ✅ CORRECT - Exclude 'id' field
$builder->belongsTo(Organization::class, fields: ['name', 'slug']);

// ❌ WRONG - Wrong parameter order in on()
Role::one($builder)->on(['roleId', 'id']); // Wrong order

// ✅ CORRECT - [parent_key, foreign_key]
Role::one($builder)->on(['id', 'userId']);

// ❌ WRONG - Missing fields() call
Role::one($builder)->on(['id', 'userId']); // No fields selected

// ✅ CORRECT - Always specify fields
Role::one($builder)->on(['id', 'userId'])->fields('role', 'name');

// ❌ WRONG - Using positional parameters instead of named
$builder->belongsTo(Organization::class, ['name', 'slug']);

// ✅ CORRECT - Use named parameter 'fields:'
$builder->belongsTo(Organization::class, fields: ['name', 'slug']);

// ❌ WRONG - Defining joins() method with lazy relationships syntax
protected static function joins(object $builder): void
{
    return $this->hasMany(Post::class); // Wrong context
}

// ✅ CORRECT - Use JoinBuilder methods in joins()
protected static function joins(object $builder): void
{
    $builder->belongsTo(Category::class, fields: ['name']);
}

// ❌ WRONG - Trying to use JoinBuilder methods outside joins()
public function posts()
{
    Post::one($this)->fields('title'); // Wrong approach
}

// ✅ CORRECT - Use relationship methods for lazy loading
public function posts(): \Proto\Models\Relations\HasMany
{
    return $this->hasMany(Post::class);
}
```

**CRITICAL**:
- `create()` takes OBJECT not array: `User::create((object)['name' => 'John'])`
- `create()` returns BOOL not object. Use instance approach to track:
  ```php
  $user = new User();
  $user->name = 'John';
  $user->add(); // now $user->id is available
  ```
- Use constructor with object for efficiency:
  ```php
  // ✅ CORRECT
  $user = new User((object)$data);
  $user->add();

  // ✅ CORRECT - Direct object
  $user = new User((object)[
        'name' => 'John',
        'email' => 'john@example.com'
  ]);
  $user->add();

  // ❌ WRONG - Verbose and unnecessary
  $user = new User();
  foreach ($data as $key => $value)
  {
      $user->$key = $value;
  }
  $user->add();

  // ❌ WRONG - Verbose and unnecessary
  $user = new User();
  $user->name = $data['name'];
  $user->email = $data['email'];
  $user->add();
  ```
- `delete()` is instance method NOT static:
  - ❌ WRONG: `User::delete(5)`
  - ✅ CORRECT: `User::remove(5)` or `$user = User::get(5); $user->delete();`
- **Eager joins**: Define in `joins()` method using JoinBuilder (`Role::one()`, `->belongsTo()`, etc.)
- **Lazy relationships**: Define as public methods returning `HasMany`, `HasOne`, `BelongsTo`, or `BelongsToMany`
- In eager `belongsTo`: ALWAYS use named parameter `fields: [...]` and EXCLUDE 'id' field
- In eager joins: `on()` order is `[parent_key, foreign_key]`

### Storage

**Base**: `Proto\Storage\Storage`

**Create ONLY if custom queries needed**. Otherwise use model methods.

**Filter Arrays**:
Storage methods can use filter arrays if set. This is an array that can add a clause to the storage query.

Filter keys in the array can be ambiguous and might need to be prefixed with the table alias if the model is
joining tables using eager joins.
```php
$filter = [
    "id = '1'", // ambiguous
	"a.id = '1'", // raw condition with table alias
	["a.created_at BETWEEN ? AND ?", ['2021-02-02', '2021-02-28']], // Manual bind
	['a.id', $user->id], // auto bind
	['a.id', '>', $user->id] // auto bind with operator
];

$row = User::getBy($filter);   // one
$rows = User::fetchWhere($filter);   // many`
```

**Query Builder**:
```php
class UserStorage extends Storage
{
    public function getActiveUsers(int $limit = 10): array
    {
        return $this->table()
            ->select()
            ->where('status = ?', 'deleted_at IS NULL')
            ->orderBy('created_at DESC')
            ->limit($limit)
            ->fetch(['active']);
    }

    // Conditional where clauses
    public function getRecords(int $id, ?string $type = null): array
    {
        $sql = $this->table()
            ->select()
            ->where('parent_id = ?', 'deleted_at IS NULL');

        $params = [$id];
        if ($type)
        {
            $sql->where('type = ?');
            $params[] = $type;
        }

        return $sql->fetch($params);
    }

    // Update with builder
    public function updateStatus(int $id, string $status): bool
    {
        return $this->table()
            ->update()
            ->set(['status' => $status, 'updated_at' => 'NOW()'])
            ->where('id = ?')
            ->execute([$id]);
    }
}
```

**Ad-hoc Queries** (when custom storage not needed):
```php
// In Model static methods
public static function getActiveUsers(): array
{
    return static::builder()
        ->select()
        ->where('status = ?', 'deleted_at IS NULL')
        ->fetch(['active']);
}

// Using closures (compact syntax)
$users = User::storage()->findAll(
    fn($sql, &$p) => (
        $p[] = 'active',
        $sql->where('status = ?')->orderBy('created_at DESC')
    )
);
```

**CRITICAL**:
- DO NOT specify `$tableName` or `$connection` (unless non-default DB)
- Use builder's `fetch()` directly: `->fetch($params)` NOT `$this->fetch($sql, $params)`
- Chain multiple where conditions in single call
- Use `first()` not `fetchOne()`
- ALWAYS use builder methods, NEVER raw SQL with table names
- NO `getTableName()` method exists - always use builder

### Migrations

**Location**: `common/Migrations` or `modules/*/Migrations`

**Structure**:
```php
<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    public function up(): void
    {
        $this->create('users', function($table)
        {
            $table->id();
            $table->uuid();
            $table->varchar('name', 100);
            $table->varchar('email', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        $this->drop('users');
    }
}
```

**Field Types**:
- Primary key: `$table->id();`
- UUID: `$table->uuid();`
- Integer: `$table->integer('field', length);`
- String: `$table->varchar('field', length);`
- Text: `$table->text('field')->nullable();`
- Decimal: `$table->decimal('amount', precision, scale);`
- Date: `$table->date('field');`
- Timestamp: `$table->timestamp('field');`
- Boolean: `$table->tinyInteger('field')->default(0);`
- Enum: `$table->enum('field', 'val1', 'val2')->default("'val1'");`

**Audit Fields**:
- `$table->timestamps();` - created_at, updated_at
- `$table->createdAt();` - created_at only
- `$table->updatedAt();` - updated_at only
- `$table->deletedAt();` - soft delete

**Indexes**:
- Single: `$table->index('idx_name')->fields('field');`
- Multiple: `$table->index('idx_name')->fields('field1', 'field2');`
- Unique: `$table->unique('unq_name')->fields('field1');`

**Foreign Keys**:
```php
$table->foreign('user_id')
    ->references('id')
    ->on('users')
    ->onDelete('CASCADE');
```

**Complete Migration Example**:
```php
<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

class CarMaintenanceRecord extends Migration
{
    public function up(): void
    {
        $this->create('car_maintenance_records', function($table)
        {
            // Primary key
            $table->id();
            $table->uuid();

            // Foreign keys
            $table->integer('car_profile_id', 30);
            $table->integer('user_id', 30);

            // Fields
            $table->varchar('title', 200);
            $table->text('description')->nullable();
            $table->enum('type', 'routine', 'repair', 'inspection')->default("'routine'");
            $table->date('service_date');
            $table->decimal('cost', 10, 2)->nullable();

            // Audit fields
            $table->createdAt();
            $table->integer('created_by', 30)->nullable();
            $table->updatedAt();
            $table->integer('updated_by', 30)->nullable();
            $table->deletedAt();

            // Indexes
            $table->index('car_profile_idx')->fields('car_profile_id', 'service_date');
            $table->index('user_idx')->fields('user_id');

            // Foreign keys
            $table->foreign('car_profile_id')->references('id')->on('car_profiles')->onDelete('CASCADE');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
        });
    }

    public function down(): void
    {
        $this->drop('car_maintenance_records');
    }
}
```

**CRITICAL**:
- Extend `Proto\Database\Migrations\Migration`
- Use `up()` and `down()` NOT `run()` and `revert()`
- Use `foreign()` NOT `foreignKey()` or `foreignId()`
- DO NOT specify `$connection` unless non-default DB

### Services

**Base**: `Common\Services\Service`

**Pattern**: Services coordinate business logic, models handle data access.

**Single Responsibility Principle**:
- Methods should do ONE thing well
- Break complex methods into smaller, focused helper methods
- Each method should have a clear, single purpose
- Avoid methods that mix validation, business logic, and persistence

**Succinct Model Instantiation**:
Always use constructor with object for efficiency:

```php
// ✅ CORRECT - Succinct
$member = new GroupMember((object)[
    'groupId' => $groupId,
    'userId' => $userId,
    'role' => $role
]);
$member->add();

// ✅ CORRECT - With conditional data
$memberData = [
    'groupId' => $groupId,
    'userId' => $userId,
    'role' => $role
];
if ($invitedBy)
{
    $memberData['invitedBy'] = $invitedBy;
}
$member = new GroupMember((object)$memberData);
$member->add();

// ❌ WRONG - Verbose
$member = new GroupMember();
$member->groupId = $groupId;
$member->userId = $userId;
$member->role = $role;
$member->add();
```

**Refactoring Long Methods**:
```php
// ❌ WRONG - Method doing too much
public function createGroup(int $userId, array $data): object|false
{
    // Validation
    $existing = Group::getBy(['slug' => $data['slug']]);
    if ($existing) return false;

    // Stripe setup
    if (!empty($data['requiresFee']))
    {
        $stripeProduct = $this->createStripeProduct(...);
        $stripePrice = $this->createStripePrice(...);
        $data['stripeProductId'] = $stripeProduct->id;
    }

    // Create group
    $group = new Group((object)$data);
    $group->add();

    // Add member
    $this->addGroupMember($group->id, $userId);

    // Update counts
    $community = Community::get($communityId);
    $community->groupCount++;
    $community->update();

    return $group;
}

// ✅ CORRECT - Delegated to focused methods
public function createGroup(int $userId, int $communityId, array $data): object|false
{
    if (!$this->isGroupSlugUnique($communityId, $data['slug']))
    {
        return false;
    }

    $stripeData = $this->setupGroupStripeIntegration($data);
    if ($stripeData === false)
    {
        return false;
    }

    $group = $this->createGroupRecord($userId, $communityId, array_merge($data, $stripeData));
    if (!$group)
    {
        return false;
    }

    $this->addGroupMember($group->id, $userId, 'owner', null);
    $this->incrementCommunityGroupCount($communityId);

    return Group::get($group->id);
}

protected function isGroupSlugUnique(int $communityId, string $slug): bool
{
    $existing = Group::getBy(['communityId' => $communityId, 'slug' => $slug]);
    return $existing === null;
}

protected function setupGroupStripeIntegration(array $data): array|false
{
    if (empty($data['requiresFee'])) return [];
    // ... focused Stripe setup logic
}

protected function createGroupRecord(int $userId, int $communityId, array $data): ?Group
{
    $group = new Group((object)array_merge($data, [
        'communityId' => $communityId,
        'createdBy' => $userId,
        'memberCount' => 1
    ]));
    $group->add();
    return $group->id ? $group : null;
}

protected function incrementCommunityGroupCount(int $communityId): void
{
    $community = Community::get($communityId);
    if ($community)
    {
        $community->groupCount++;
        $community->update();
    }
}
```

**CRITICAL**:
- Services NEVER instantiate storage classes directly
- ❌ WRONG: `$storage = new UserStorage(); $storage->getUsers();`
- ✅ CORRECT: `User::fetchWhere([...])`
- For complex queries, add static methods to model that delegate to storage
- Extract repeated logic into focused helper methods
- Helper methods should be protected unless needed elsewhere

### Validation

**Format**: `'type[:max]|required'`

**Types**: `int`, `float`, `string`, `email`, `ip`, `phone`, `mac`, `bool`, `url`, `domain`

**Examples**:
- `'string:255|required'`
- `'email|required'`
- `'int|required'`

### Auth & Policies

**Gates** (Authentication helpers):
```php
// Create in Common/Auth extending Proto\Auth\Gates\Gate
class UserGate extends Gate
{
    public function isUser(int $userId): bool
    {
        $sessionUserId = $this->session->get('user')->id ?? null;
        return $sessionUserId === $userId;
    }

    public function isAdmin(): bool
    {
        return $this->session->get('role') === 'admin';
    }
}

// Register globally
$auth = auth();
$auth->user = new UserGate();
$auth->user->isUser(1); // Use anywhere
```

**Policies** (Authorization):
The Common policy adds a type proprety to identify the policy type and uses a request method to
check if the user is authorized to perform the action by the typer and request action method.

Module policies extend the Common policy and define per-action methods as needed.

```php
// Create in Modules/ModuleName/Auth/Policies extending Common\Auth\Policies\Policy
class UserPolicy extends Policy
{
    /**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'user';

    // Runs before all methods
    protected function before(): bool
    {
        return (auth()->user->isAdmin());
    }

    // ovreride this to add a default policy for all actions if no per-action method exists
    protected function default(): bool
    {
        return false;
    }

    // Per-action methods
    public function get(int $id): bool
    {
        return auth()->user->isUser($id);
    }

    // after method hook example
    public function afterGet(mixed $result): bool
    {
        // check the result object if needed
        $userId = session()->user->id ?? null;
        if (!$userId)
        {
            return false;
        }

        return ($result->id === $userId);
    }

    public function update(int $id): bool
    {
        return auth()->user->isUser($id);
    }
}

// Apply to controller
class UserController extends ResourceController
{
    protected ?string $policy = UserPolicy::class;
}

// Routes with dynamic params
router()->resource('user/:userId/account', UserController::class);
```

## 4. Frontend Development (Base Framework)

### Core Philosophy

**CRITICAL: This is NOT React/Vue/JSX**

- **No Templates**: Structure defined via plain JavaScript objects
- **No JSX**: Parser turns objects into DOM
- **Children as 2nd argument**: NEVER in props
- **Reactive Data**: Use `new Data({})` NOT `useState`
- **Component instances**: Always `new Component()`, never `new Atom()`

### Common Mistakes (READ FIRST)

1. ❌ DON'T use templates or JSX
2. ❌ DON'T pass children in props: `Div({ children: [...] })`
3. ❌ DON'T use `new` with Atoms: `new Button()`
4. ❌ DON'T forget `new` with Components: `MyComponent()`
5. ❌ DON'T use `.map()` for reactive lists
6. ❌ DON'T use `Import('./file.js')` - use function form
7. ❌ DON'T call `render()` directly
8. ❌ DON'T access DOM before `afterSetup()`

### Component Structure

```javascript
import { Component, Data } from '@base-framework/base';
import { Div, Button } from '@base-framework/atoms';

export class Counter extends Component
{
    setData()
    {
        return new Data({ count: 0 });
    }

    setupStates()
    {
        return { isOpen: false };
    }

    render()
    {
        return Div({ class: 'counter' }, [
            Div('Count: [[count]]'),
            Button({ click: () => this.data.count++ }, 'Increment')
        ]);
    }

    // Lifecycle hooks (in order)
    onCreated() { /* props available, NO DOM yet */ }
    beforeSetup() { /* before render */ }
    afterSetup() { /* DOM created, this.panel available */ }
    afterLayout() { /* DOM in document, safe for measurements */ }
    beforeDestroy() { /* cleanup before removal */ }
}

// Usage: new Counter()
```

### Layout Patterns

**Basic**:
```javascript
// Props 1st, children 2nd
Div({ class: 'container' }, [
    Div('Text'),
    Button({ click: handler }, 'Click')
])

// Text only
Div('Just text')

// Props only
Div({ class: 'empty' })
```

**Data Binding**:
```javascript
// Simple watcher
{ class: 'status-[[status]]' }

// Input binding
Input({ bind: 'username' })
Input({ bind: 'user.email' })

// Checkbox
Input({ type: 'checkbox', bind: 'accepted' })

// Select
Select({ bind: 'form.color' }, [
    Option({ value: 'red' }, 'Red'),
    Option({ value: 'blue' }, 'Blue')
])
```

**Lists** (CRITICAL):
```javascript
// ✅ CORRECT - Use map directive
Ul({ map: [items, (item) => Li(item.name)] })
Div({ map: [this.data.items, (item) => ItemCard(item)] }) // static version
Div({ for: ['items', (item) => ItemCard(item)] }) // reactive version

// ✅ Also works
Ul([items.map(item => Li(item))])
```

**Watchers & Computed**:
```javascript
// Simple property watch (watches this.data.status)
{ class: 'status-[[status]]' }

// Multiple properties
{ text: 'User: [[name]] Age: [[age]]' }

// Deep paths
{ text: '[[user.profile.name]]' }

// Two Data sources
{ class: ['theme-[[theme]] [[page]]', [data1, data2]] }
```

**Conditionals**:
```javascript
// Simple
{ children: [condition && element] }
```

### Atoms (Functional)

**Create**:
```javascript
import { Atom } from '@base-framework/base';
import { Button as BaseButton } from '@base-framework/atoms';

const Button = Atom((props, children) => (
    BaseButton({
        type: 'button',
        ...props,
        class: `btn ${props.class || ''}`
    }, children)
));
```

**Usage**:
```javascript
// ✅ CORRECT - No 'new'
Button({ class: 'primary' }, 'Click')
Button('Text only')

// ❌ WRONG
new Button()
```

### Icons

**Import**:
```javascript
import { Icons } from '@base-framework/ui/icons';
import { Icon } from '@base-framework/ui/atoms';
```

**Usage**:
```javascript
// ✅ CORRECT
Icon({ size: 'sm' }, Icons.home)
I({ html: Icons.home })
Button({ variant: 'withIcon', icon: Icons.plus }, 'Add')

// ❌ WRONG
Icon(Icons.home)
Icon({ icon: Icons.home })
```

### State Management

**Component Data**:
```javascript
setData()
{
    return new Data({
        count: 0,
        items: [],
        user: { name: '' }
    });
}

// Update
this.data.count = 5;
this.data.set('count', 5);
this.data.push('items', item);
this.data.refresh('key');
```

**Component States**:
```javascript
setupStates()
{
    return {
        isOpen: false,
        view: 'list'
    };
}

// Update
this.state.set('isOpen', true);
this.state.toggle('isOpen');
this.state.increment('count');
```

### HTTP Requests

```javascript
import { Ajax } from '@base-framework/base';

// GET
Ajax({
  method: 'GET',
  url: '/api/users',
  params: { active: 1 },
  completed: (response, xhr) => {}
});
```

### Routing

```javascript
import { router, NavLink } from '@base-framework/base';

// Setup FIRST
router.setup('/app/', 'App Title');

// Switch (first match)
{
    switch: [
        { uri: '/login', component: Login },
        { uri: '/users/:id', component: UserDetail },
        { component: NotFound }
    ]
}

// Access params
class UserDetail extends Component
{
    render()
    {
      const id = this.route.id;
        return Div(`User ID: ${id}`);
    }
}

// NavLink
new NavLink({
    href: '/users',
    text: 'Users',
    exact: true,
    activeClass: 'active'
})
```

### Dynamic Imports

```javascript
import { Import } from '@base-framework/base';

// ✅ CORRECT - Function form
Import(() => import('./components/heavy.js'))

// Route-based
{
    switch: [
        { uri: '/dashboard', import: () => import('./pages/dashboard.js') }
    ]
}

// ❌ WRONG
Import('./file.js')
```

## 5. Anti-Patterns (What NOT to Do)

### Backend (PHP)

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `User::delete(1)` | `User::remove(1)` or `$user->delete()` |
| `new UserStorage()` in Controller | `User::fetchWhere([...])` |
| `$table->foreignKey('user_id')` | `$table->foreign('user_id')` |
| `function test() {` | `function test()\n{` |
| `$user = User::create($data);` | `$user = new User(); $user->add();` |
| `->where('a')->where('b')` | `->where('a', 'b')` |
| `->fetchOne()` | `->first()` |
| `$this->request` in `addItem()` | Use `modifiyAddItem($data, $request)` hook |
| Override `addItem()` for route params | Use `modifiyAddItem()` or override `add()` |
| `protected function modifyAddItem()` | `protected function modifiyAddItem()` (typo) |
| `\Modules\User\Models\User::get()` | `use Modules\User\Models\User; User::get()` |
| `$request->route('id')` | `$request->getInt('id')` or `$request->input('id')` |
| `if (!$userId) return error()` in controller | Remove check - policy handles auth |
| `$userId = session()->user->id ?? null;` | `$userId = session()->user->id;` after policy |
| `throw new \Exception()` in controller | `$this->setError()` or `$this->error()` |
| `$m = new Model(); $m->x = 1; $m->add();` | `$m = new Model((object)['x' => 1]); $m->add();` |
| `$builder->belongsTo(Org::class, ['name'])` | `$builder->belongsTo(Org::class, fields: ['name'])` |
| `Role::one($builder)->on(['roleId', 'id'])` | `Role::one($builder)->on(['id', 'userId'])` (parent first) |
| `$builder->belongsTo(Org::class, fields: ['id', 'name'])` | Exclude 'id': `fields: ['name']` |
| `return $this->hasMany(Post::class)` in `joins()` | Use JoinBuilder methods in `joins()` |
| `Post::one($this)->fields('title')` outside `joins()` | Use lazy relationships: `hasMany()` |

### Frontend (Base)

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `Div({ children: [...] })` | `Div({}, [...])` |
| `Ul([items.map(...)])` | `Ul({ map: [items, ...] })` |
| `new Button()` | `Button()` |
| `Icon(Icons.home)` | `Icon({ size: 'sm' }, Icons.home)` |
| `Import('./file.js')` | `Import(() => import('./file.js'))` |
| `Icon({ icon: Icons.home })` | `Icon({ size: 'sm' }, Icons.home)` |

## 6. Testing (Backend)

The Proto test framework extends PHPUnit and provides helpers for database assertions and test setup. There are a few traits applied to the base Test class that provide common functionality. Check the Proto composer module `src\Tests\Test` class for details.
### Test Structure

```php
<?php declare(strict_types=1);

namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\User;

class UserTest extends Test
{
    public function testCreateUser(): void
    {
        $user = new User();
        $user->name = 'John';
        $user->email = 'john@example.com';
        $user->add();

        $this->assertDatabaseHas('users', [
            'name' => 'John',
            'email' => 'john@example.com'
        ]);
    }
}
```

### Test Helpers

**Creating Test Data**:
```php
// Use factories for model creation
protected function createUser(): User
{
    return User::factory()->create([
        'username' => 'testuser' . uniqid(),
        'email' => 'test' . uniqid() . '@example.com'
    ]);
}

// Or manual instantiation (ensure all required fields)
protected function createUser(): User
{
    $user = new User((object)[
        'username' => 'testuser' . uniqid(),
        'email' => 'test' . uniqid() . '@example.com',
        'password' => password_hash('password123', PASSWORD_DEFAULT),
        'firstName' => 'Test',
        'lastName' => 'User',
        'status' => 'offline'
    ]);
    $user->add();

    if (!$user->id)
    {
        throw new \Exception('Failed to create test user');
    }

    return $user;
}
```

### Patterns

**Factories**:
```php
User::factory()->create();           // Persisted
User::factory()->make();             // Unpersisted
User::factory()->count(5)->create(); // Bulk
User::factory()->create(['email' => 'specific@example.com']); // Custom attributes
```

**Assertions**:
```php
$this->assertDatabaseHas('table', [...]);
$this->assertDatabaseMissing('table', [...]);
$this->assertDatabaseCount('table', 5);
$this->assertTrue($condition);
$this->assertEquals($expected, $actual);
$this->assertNotNull($value);
$this->assertIsArray($value);
```

### Transaction Limitations

**CRITICAL**:
- Tests auto-wrap in transactions (rollback automatically)
- `Model::get($id)` and `Model::getBy([...])` may return null for data created in same transaction
- Use `Model::fetchWhere([...])` and convert to model: `new Model($data)` for transaction-safe queries although we have pushed updates to handle this better, if you have issues still use this pattern.
- Prefer `assertDatabaseHas()` over re-fetching models when verifying data
- Don't disable foreign key checks
- Don't call custom static methods in tests (may create new connections)

**Example Transaction-Safe Pattern**:
```php
// ✅ CORRECT - Direct assertion
$user = User::factory()->create();
$this->assertDatabaseHas('users', ['id' => $user->id, 'email' => $user->email]);

// ✅ CORRECT - Use returned object
$user = User::factory()->create();
$this->assertEquals('test@example.com', $user->email);

// ⚠️ MAY FAIL - Re-fetching in transaction
$user = User::factory()->create();
$fetched = User::get($user->id); // May return null
$this->assertNotNull($fetched); // May fail

// ✅ CORRECT - fetchWhere alternative
$users = User::fetchWhere(['id' => $user->id]);
if (!empty($users))
{
    $fetched = new User($users[0]);
}
```

## 7. Configuration

**Location**: `common/Config/.env` (JSON format)

**Access**: `env('key')` or `env('key.nested')`

**Docker Sync**: `./infrastructure/scripts/run.sh sync-config`

## 8. Integration Points

- **Database**: MariaDB (port 3307 on host)
- **Cache**: Redis (port 6380 on host)
- **Email**: SMTP settings from `common/Config/.env`
- **Frontend**: Proxies `/api` to backend via Vite config

## 9. Quick References

### Add New Feature

**Backend**:
1. Create controller: `modules/Feature/Controllers/FeatureController.php`
2. Register routes: `modules/Feature/Api/api.php`
   - **Nested API folders supported**: `modules/Feature/Api/Subfeature/api.php` → path prefix `api/feature/subfeature/...`
3. Add migrations: `modules/Feature/Migrations/*`
4. Add tests: `modules/Feature/Tests/Feature/*Test.php`

**Frontend**:
1. Create component: `apps/main/src/components/Feature.js`
2. Call API: `Ajax.get('/api/feature')` (relative paths - Vite proxy handles routing)
3. Add route: Update router config

### Key Files

- Backend boot: `public/api/index.php`
- Docker config: `infrastructure/docker-compose.yaml`
- Migrations runner: `infrastructure/scripts/run-migrations.php`
- Frontend proxy: `apps/*/vite.config.js`
- Domain config: `infrastructure/config/domain.config.js`
- Config flow: `common/Config/.env` (JSON) → `infrastructure/scripts/sync-config.js` → root `.env`

### Debugging & Gotchas

**Docker Issues**:
- If `vendor/` missing: Container runs `composer install` automatically. Check: `docker-compose logs -f web`
- Auto-migrations: Disable for production with `AUTO_MIGRATE=false`

**CORS Issues**:
- Origins from `sync-config.js` using dev ports in `common/Config/.env`
- Update JSON config and run `./infrastructure/scripts/run.sh sync-config`

**Frontend API Calls**:
- Always use relative paths: `/api/...` (Vite proxy resolves host)
- DON'T hardcode domains - proxy handles environment

**Database Ports**:
- MariaDB: Host port 3307 (container port 3306)
- Redis: Host port 6380 (container port 6379)
