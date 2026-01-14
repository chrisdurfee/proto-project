# Copilot Instructions for Proto Project

Use these repo-specific rules to be productive immediately.

## Big picture
- Backend: PHP 8.4 monolith using Proto Framework. Entry: `public/api/index.php` boots `Proto\Api\ApiRouter::initialize()`.
- Code layout: `modules/*` (feature modules), `common/*` (shared framework glue), `public/*` (HTTP entrypoints/assets).
- Autoloading: PSR-4 maps `Modules\` → `modules/`, `Common\` → `common/` (see `composer.json`). Migrations are classmapped from `common/Migrations` and `modules/*/Migrations`.
- Frontend: Three Vite apps in `apps/{main,crm,developer}` using Base Framework UI libs. Each proxies `/api` to the backend based on `infrastructure/config/domain.config.js`.
- Infra: `infrastructure/docker-compose.yaml` runs `web` (php-apache), `mariadb`, `redis`. Container entrypoint installs deps if missing and (optionally) runs DB migrations.

## Critical workflows
- One-time config: copy JSON env and sync to Docker
  - `common/Config/.env-example` → `common/Config/.env`
  - `./infrastructure/scripts/run.sh sync-config` generates root `.env` for Docker from JSON config
- Start services: `docker-compose -f infrastructure/docker-compose.yaml up -d` (auto-migrations by default via `AUTO_MIGRATE=true`)
  - Logs: `docker-compose -f infrastructure/docker-compose.yaml logs -f web` • Shell: `docker-compose -f infrastructure/docker-compose.yaml exec web bash`
  - Manual migrations: `docker-compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php`
- Frontend dev: in each app, `npm install` then `npm run dev` (ports 3000/3001/3002; `/api` is proxied to the container at 8080)
- Tests: run locally with `php vendor/bin/phpunit` or in Docker container. Suites defined in `phpunit.xml`:
  - Unit: `common/Tests/Unit` • Feature: `common/Tests/Feature`, `modules/*/Tests/Feature` • Module tests under `modules/**`
  - Run specific tests: `php vendor/bin/phpunit modules/User/Tests/Feature/PermissionTest.php`
  - Run with output: `php vendor/bin/phpunit --testdox` for readable test names

## Conventions and patterns
- Configuration is JSON in `common/Config/.env`. Access in PHP via Proto Config helpers (e.g., `env('siteName')`).
- Routes live in module API registries. Example (`modules/YourFeature/Api/api.php`):
  - `router()->resource('feature', Modules\YourFeature\Controllers\FeatureController::class);`
- Services extend `Common\Services\Service`. Use `Common\Data` (a `Proto\Patterns\Structural\Registry` singleton) for shared app state when needed.
- Modules live under `modules/*` and require a main module class.
  - **CRITICAL Module Structure**:
    * Use `Proto\Module\Module` NOT `Proto\Modules\Module` (note: singular "Module")
    * Module class must have `activate()` method NOT `boot()`
    * Place module class at `modules/YourModule/YourModuleModule.php`
    * Module system automatically loads API routes from `modules/*/Api/api.php` - no need to load them manually
    * Module structure:
      ```php
      <?php declare(strict_types=1);

      namespace Modules\YourModule;

      use Proto\Module\Module;

      class YourModuleModule extends Module
      {
          public function activate(): void
          {

          }
      }
      ```
- Migrations are PHP classes under `common/Migrations` or `modules/*/Migrations`. They're executed by `infrastructure/scripts/run-migrations.php` (entrypoint runs them when `AUTO_MIGRATE=true`).
- Files: writable volumes are mounted at `public/files` and `common/files` (see `infrastructure/docker-compose.yaml`).
- **CRITICAL PHP Code Style**:
  * Opening braces ALWAYS on new line (methods, classes, if/else, loops, etc.)
  * NO blank lines between variable assignment and immediate condition check
  * Example:
    ```php
    // ✅ CORRECT
    $carProfile = CarProfile::get($carProfileId);
    if (!$carProfile)
    {
        return false;
    }

    // ❌ WRONG - blank line between variable and check
    $carProfile = CarProfile::get($carProfileId);

    if (!$carProfile) {
        return false;
    }

    // ✅ CORRECT - opening brace on new line
    public function getUserCars(int $userId): array
    {
        return CarProfile::fetchWhere(['userId' => $userId]);
    }

    // ❌ WRONG - opening brace on same line
    public function getUserCars(int $userId): array {
        return CarProfile::fetchWhere(['userId' => $userId]);
    }
    ```

## Proto coding patterns (AI quick recipes)
- Controllers
  - Extend `Proto\Controllers\ResourceController` for CRUD or `ApiController` for custom endpoints.
  - Bind a model: `class UserController extends ResourceController { public function __construct(protected ?string $model = User::class){ parent::__construct(); } }`
  - Helpers: `$this->getRequestItem(Request)`, `$this->getResourceId(Request)`, `$this->response($data)`, `$this->error($message)`.
  - Validation: implement `protected function validate(): array` or call `$this->validateRules($data, ['name' => 'string:255|required'])` or `$request->validate([...])`.
  - Pass-through: public methods on the model (and its storage) are auto-wrapped in a Response when invoked via the controller.
  - **IMPORTANT**: Controllers should NOT access storage classes directly. Use the model to access the storage layer: `$car = CarProfile::get($id)` not `$storage->get($id)`.
- Services
  - Extend `Common\Services\Service` for business logic.
  - **CRITICAL**: Services should NEVER instantiate storage classes directly. Always use model methods to access data.
  - **WRONG**: `$storage = new UserStorage(); $storage->getUsers();`
  - **CORRECT**: `User::fetchWhere([...])` or add custom static methods to the model that delegate to storage.
  - For complex queries, add static methods to the model: `User::getActiveUsers()` which internally calls `static::storage()->getActiveUsers()`.
  - Services coordinate business logic, models handle data access.
- Routing
  - Register in `modules/*/Api/api.php`: `router()->resource('users', Modules\User\Controllers\UserController::class);`
  - **CRITICAL Routing Patterns**:
    * Module API paths MUST start with the module name. Garage module routes: `'garage/...'` NOT `'user/:id/garage/...'`
    * Controller method syntax: ALWAYS wrap in array `[Controller::class, 'method']` NOT `Controller::class, 'method'`
    * Use fluent interface for chaining: `router()->resource(...)->get(...)->post(...)`
    * **WRONG**: `router()->get('path', Controller::class, 'method');`
    * **CORRECT**: `router()->get('path', [Controller::class, 'method']);`
    * **WRONG**: Separate router() calls for related routes
    * **CORRECT**: Chain with fluent interface:
      ```php
      router()
          ->resource('garage', GarageVehicleController::class)
          ->get('garage/portfolio', [GarageVehicleController::class, 'portfolio'])
          ->post('garage/reorder', [GarageVehicleController::class, 'reorder']);
      ```
    * Use groups for shared path prefixes:
      ```php
      router()->group('auth/crm', function(Router $router)
      {
          $router->post('login', [AuthController::class, 'login']);
          $router->post('mfa/verify', [AuthController::class, 'verifyAuthCode']);
      });
      ```
    * Apply middleware to groups: `router()->middleware([ThrottleMiddleware::class])->group(...)`
- Query patterns
  - Simple: `User::getBy(['name' => $name])`, `User::fetchWhere(['status' => 'active'])`.
  - Builder: `User::where(['name' => $name])->orderBy('id DESC')->groupBy('id')->fetch();`
  - Storage closures: `$this->storage()->findAll(fn($sql,&$p)=>($p[]='active',$sql->where('status = ?')->orderBy('status DESC')));`
- Validation rules
  - Format: `'type[:max]|required'` (e.g., `'string:255|required'`, `'email|required'`, `'int|required'`).
  - Common types: `int,float,string,email,ip,phone,mac,bool,url,domain`.
- Migrations
  - Place classes under `common/Migrations` or `modules/*/Migrations`; executed by the migration runner.
  - **CRITICAL Migration Structure**:
    * Extend `Proto\Database\Migrations\Migration` NOT `Guide`
    * Use regular named classes, NOT anonymous classes with `return new class`
    * Methods are `up()` and `down()` NOT `run()` and `revert()`
    * File structure:
      ```php
      <?php declare(strict_types=1);

      use Proto\Database\Migrations\Migration;

      /**
       * Migration description
       */
      class TableName extends Migration
      {
          public function up(): void
          {
              $this->create('table_name', function($table) {
                  // Define table schema
              });
          }

          public function down(): void
          {
              $this->drop('table_name');
          }
      }
      ```
  - **CRITICAL Field Definition Patterns**:
    * Primary key: `$table->id();` (auto-incrementing bigint)
    * UUID: `$table->uuid();` (not uuid('fieldname'))
    * Integers: `$table->integer('field_name', length);` (e.g., `$table->integer('user_id', 30);`)
    * Strings: `$table->varchar('field_name', length);` (e.g., `$table->varchar('name', 100);`)
    * Text: `$table->text('field_name')->nullable();`
    * Decimals: `$table->decimal('amount', precision, scale);` (e.g., `$table->decimal('price', 10, 2);`)
    * Dates: `$table->date('field_name');`
    * Timestamps: `$table->timestamp('field_name');`
    * Booleans/TinyInt: `$table->tinyInteger('field_name')->default(0);`
    * Enums: `$table->enum('field_name', 'value1', 'value2', 'value3')->default("'value1'");` (note: default value needs quotes inside quotes)
  - **CRITICAL Audit Field Shortcuts**:
    * `$table->createdAt();` - creates created_at timestamp with useCurrent
    * `$table->updatedAt();` - creates updated_at timestamp with useCurrentOnUpdate
    * `$table->deletedAt();` - creates deleted_at timestamp nullable for soft deletes
    * `$table->timestamps();` - creates the created_at and updated_at fields together
    * Created/updated by: `$table->integer('created_by', 30)->nullable();`
  - **CRITICAL Index Patterns**:
    * Single field: `$table->index('index_name')->fields('field_name');`
    * Multiple fields: `$table->index('index_name')->fields('field1', 'field2', 'field3');`
    * Unique constraint: `$table->unique('constraint_name')->fields('field1', 'field2');`
  - **CRITICAL Foreign Key Rules**:
    * Syntax: `$table->foreign('local_column')->references('remote_column')->on('remote_table')->onDelete('CASCADE');`
    * DO NOT use `foreignKey()` - that method does not exist
    * Use `foreign()` method, NOT `foreignId()` or `foreignKey()`
    * Common onDelete actions: 'CASCADE', 'SET NULL' (requires nullable column)
    * DO NOT specify connection in migrations unless using non-default DB: omit `protected string $connection = 'default';`
  - **Complete Migration Example**:
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
- File storage
  - Use `Proto\Utils\Files\Vault` (see Developer app docs) for storing/retrieving files; buckets map to `public/files` or remote drivers.

## Models & Storage (backend)
- Models
  - Extend `Proto\Models\Model`; set `protected static ?string $tableName`, `protected static array $fields`, optional `protected static array $fieldsBlacklist`, `protected static string $idKeyName = 'id'`.
  - Pre/post hooks: `protected static function augment(mixed $data = null): mixed` to sanitize before persist, `protected static function format(?object $data): ?object` to shape API output.
  - Relations (lazy): `$this->hasMany(Post::class)`, `$this->hasOne(Profile::class)`, `$this->belongsTo(User::class)`, `$this->belongsToMany(Role::class, 'pivot', 'fk', 'rk')`.
  - Eager joins (builder): define `protected static function joins($builder): void { Role::one($builder)->on(['id','userId'])->fields('role'); }`.
  - Pass-through: undeclared model/storage public methods auto-wrap in Response via controllers; bypass via `static::$storageType::methodName()`.
  - **CRITICAL Model CRUD Methods**:
    * **Static methods** (operate on class): `create()`, `edit()`, `remove()`, `put()`, `get()`, `all()`
    * **Instance methods** (operate on object): `add()`, `update()`, `delete()`, `setup()`
    * `create()` takes OBJECT, returns BOOL: `User::create((object)['name' => 'John']);`
    * `remove()` accepts object|int|string|null: `User::remove(5)` or `User::remove($user)` or `User::remove($userId)`
    * `delete()` is instance method, NOT static: `$user = User::get(1); $user->delete();`
    * **WRONG**: `User::delete(5)` - delete() is not static!
    * **CORRECT**: `User::remove(5)` or `$user = User::get(5); $user->delete();`
  - **CRITICAL Model Usage**:
    * Model `create()` takes an OBJECT not array: `Model::create((object)['field' => 'value']);`
    * `create()` returns a BOOL not object. To track the model instance, create instance and use `add()`: `$model = new Model(); $model->field = 'value'; $model->add();`
    * For tests: Use instance approach to get the created model: `$car = new CarProfile(); $car->year = 2020; $car->add(); // now $car->id is available`
  - **CRITICAL Eager Join Patterns**:
    * Use named parameters for fields: `fields: []` not positional `[]`
    * In belongsTo joins, DO NOT include 'id' field (would override child table's id)
    * Example:
      ```php
      protected static function joins(object $builder): void
      {
          $builder->belongsTo(CarProfile::class, fields: ['nickname', 'year', 'make', 'model']);
          $builder->belongsTo(User::class, fields: ['firstName', 'lastName', 'displayName']);
      }
      ```
    * **WRONG**: `->belongsTo(User::class, ['id', 'name'])` - positional params
    * **WRONG**: `->belongsTo(CarProfile::class, fields: ['id', 'year'])` - includes 'id'
    * **CORRECT**: `->belongsTo(CarProfile::class, fields: ['year', 'make', 'model'])`
- Storage
  - Extend `Proto\Storage\Storage` (name ends with `Storage`).
  - **DO NOT** specify tableName - storage gets table info from the model that instantiates it
  - **DO NOT** specify connection unless using non-default DB. Omit: `protected string $connection = 'default';` (it's already default)
  - **CRITICAL Query Builder Patterns**:
    * Use SQL builder's `fetch()` directly, NOT storage's `fetch()`: `return $this->table()->select()->where(...)->fetch($params);`
    * Chain multiple where conditions in single call: `->where('field1 = ?', 'field2 IS NOT NULL', 'field3 > ?')`
    * DO NOT chain multiple `->where()` calls separately
    * Use `first()` not `fetchOne()`: `->first([$params])` (adds LIMIT 1 automatically)
    * **ALWAYS use builder methods** - DO NOT write raw SQL with table names. There is NO `getTableName()` method.
    * For updates: `$this->table()->update()->set(['field' => $value])->where('id = ?')->execute([$id]);`
    * **WRONG**: `$tableName = $this->table()->getTableName(); $sql = "UPDATE {$tableName}...";`
    * **CORRECT**: `$this->table()->update()->set([...])->where(...)->execute([...]);`
    * **WRONG**: `$sql = $this->table()->select()->where('id = ?'); return $this->fetch($sql, [$id]);`
    * **CORRECT**: `return $this->table()->select()->where('id = ?')->fetch([$id]);`
  - Query builder: `$sql = $this->table()->select()->where("status = 'active'"); $rows = $sql->fetch($params);`
  - Filters: mixed formats supported, e.g., `["a.id = '1'"], ["a.id", $id], ["a.id", ">", $id], ["created_at BETWEEN ? AND ?", [$d1,$d2]]`.
  - Ad-hoc queries: `findAll(fn($sql,&$p)=>($p[]='active',$sql->where('status = ?')->orderBy('status DESC')));` and `find(fn($sql,&$p)=>($p[]='active',$sql->where('status = ?')->limit(1)));`.
  - Direct adapter: `$this->db->fetch('SELECT * FROM users')`; transactions via `beginTransaction/commit/rollback`.
  - Only create and declare a storage class if you need custom queries; otherwise use model methods and add custom methods to the model that delegate to storage using the model static builder method.
```php
class PermissionRole extends Model
{
	public function deleteRolePermission(mixed $roleId, mixed $permissionId): bool
	{
		return static::builder()
			->delete()
			->where(
				['role_id', $roleId],
				['permission_id', $permissionId]
			)
			->execute();
	}
}
```

## Auth & Policies (backend)
- Gates
  - Create in `Common\Auth` extending `Proto\Auth\Gate`; expose auth helpers (uses `Proto\Http\Session`).
  - Register on global `auth()` singleton: `$auth = auth(); $auth->user = new UserGate(); $auth->user->isUser(1);`.
- Policies
  - Create in `Common\Auth\Policies` extending `Proto\Auth\Policies\Policy`; implement `default()`, per-action methods (e.g., `get($id)`), and lifecycle `before()`/`after($result)`.
  - Apply to controller: `protected ?string $policy = UserPolicy::class;` (enforced when routed via `router()->resource(...)`).
  - Example route: `router()->resource('user/:userId/account', Modules\User\Controllers\UserController::class);`

## Integration points
- Database: MariaDB (port 3307 on host). Config is sourced from `common/Config/.env` via `infrastructure/scripts/sync-config.js`.
- Cache: Redis (port 6380 on host). Env is generated by `infrastructure/scripts/sync-config.js` from `cache.connection`.
- Email: SMTP settings populated from `common/Config/.env` (`email.smtp.*`). See `common/Email/*` and `common/Services/EmailService.php`.
- Frontend URLs: `infrastructure/config/domain.config.js` exposes `generateUrls(isDev)` used by each `vite.config.js` to set proxy targets.

## Adding features (fast path)
- Backend API:
  - Create controller in `modules/Feature/Controllers/...`
  - Register routes in `modules/Feature/Api/api.php` (use `router()->resource(...)` or custom routes). The API folder supports nested subfolders. e.g. `modules/Feature/Api/Subfeature/api.php`. This would have the path prefix `api/feature/subfeature/...`.
  - Add migrations in `modules/Feature/Migrations/*`
  - Tests in `modules/Feature/Tests/{Unit,Feature}/*Test.php`
- Frontend:
  - Call the API with relative paths (`/api/...`); Vite proxy resolves the host automatically.
  - Don’t hardcode domains—derive via `generateUrls` in `vite.config.js` if needed.

## Debugging and gotchas
- If `vendor/` isn’t present due to bind mounts, the container entrypoint runs `composer install` automatically. Check `docker-compose logs -f web`.
- Disable auto-migrations for production by setting `AUTO_MIGRATE=false` (then run the migration script manually).
- CORS origins come from `sync-config.js` using dev ports in `common/Config/.env`. Update that JSON and resync if browser requests are blocked.

Key files to orient quickly:
- Backend boot: `public/api/index.php`, `infrastructure/docker/Dockerfile`, `infrastructure/docker/entrypoint.sh`
- Config flow: `common/Config/.env` (JSON) → `infrastructure/scripts/sync-config.js` → root `.env` used by `infrastructure/docker-compose.yaml`
- Frontend proxy: each `apps/*/vite.config.js` + `infrastructure/config/domain.config.js`

## PHP Code Style & Best Practices

### Formatting Rules
1. **Opening braces on next line** - Always place opening braces on a new line for methods, classes, if/else, loops:
   ```php
   // ✅ CORRECT
   public function methodName()
   {
       if ($condition)
       {
           // code
       }
   }

   // ❌ WRONG - Don't use same-line braces
   public function methodName() {
       if ($condition) {
           // code
       }
   }
   ```

2. **No blank lines between related code** - Keep variable declarations and their immediate usage together:
   ```php
   // ✅ CORRECT
   $carProfile = CarProfile::get($carProfileId);
   if (!$carProfile)
   {
       return false;
   }

   // ❌ WRONG - Don't add blank line
   $carProfile = CarProfile::get($carProfileId);

   if (!$carProfile)
   {
       return false;
   }
   ```

### Creating Model Instances

**✅ CORRECT - Use constructor with object**:
```php
// Service layer converting array to object
public function createRecord(array $data): ?object
{
    $model = new Model((object)$data);
    $model->add();
    return $model;
}
```

**❌ WRONG - Don't use foreach loop**:
```php
// Don't do this - unnecessary verbosity
$model = new Model();
foreach ($data as $key => $value)
{
    $model->$key = $value;
}
$model->add();
```

### Migration Best Practices

1. **Foreign key method is `foreign()` not `foreignKey()`**:
   ```php
   // ✅ CORRECT
   $table->foreign('organization_id')
       ->references('id')
       ->on('organizations')
       ->onDelete('cascade');

   // ❌ WRONG - method doesn't exist
   $table->foreignKey('organization_id')
       ->references('id')
       ->on('organizations');
   ```

2. **Only specify `$connection` if non-default**:
   ```php
   // ✅ CORRECT - Omit when using default connection
   class CarProfileStorage extends Storage
   {
       // No $connection property needed
   }

   // ❌ WRONG - Unnecessary boilerplate
   class CarProfileStorage extends Storage
   {
       protected string $connection = 'default';
   }
   ```

### Storage Query Patterns

1. **Use builder methods directly, not storage wrappers**:
   ```php
   // ✅ CORRECT - Call fetch() on builder
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

   // ❌ WRONG - Don't call $this->fetch()
   return $this->fetch($sql, $params);
   ```

2. **Chain multiple where conditions**:
   ```php
   // ✅ CORRECT - Single where() call with multiple conditions
   return $this->table()
       ->select()
       ->where(
           'parent_id = ?',
           'field IS NOT NULL',
           'field <= DATE_ADD(CURDATE(), INTERVAL ? DAY)',
           'deleted_at IS NULL'
       )
       ->orderBy('created_at ASC')
       ->fetch([$id, $days]);

   // ❌ WRONG - Multiple chained where() calls
   ->where('parent_id = ?')
   ->where('field IS NOT NULL')
   ->where('field <= DATE_ADD(CURDATE(), INTERVAL ? DAY)')
   ```

3. **Use `first()` not `fetchOne()` for single record**:
   ```php
   // ✅ CORRECT - first() adds LIMIT 1 automatically
   return $this->table()
       ->select()
       ->where('user_id = ?', 'is_primary = 1')
       ->first([$userId]);

   // ❌ WRONG - fetchOne() doesn't exist
   return $this->table()->select()->fetchOne([$userId]);
   ```

### Model Joins & Relationships

**Use named parameters for `fields` in joins**:
```php
// ✅ CORRECT - Named parameter, exclude 'id' in belongsTo
protected static function joins(object $builder): void
{
    $builder
        ->belongsTo(Parent::class, fields: ['name', 'status'])
        ->belongsTo(User::class, fields: ['firstName', 'lastName']);
}

// ❌ WRONG - Don't include 'id' in belongsTo (would override child ID)
->belongsTo(Parent::class, fields: ['id', 'name', 'status'])
```

### Controller Patterns

**Controllers use models, not storage directly**:
```php
// ✅ CORRECT - Use model methods
public function getData(Request $request): object
{
    $id = $request->input('id');
    if (!$id)
    {
        return $this->error('ID is required');
    }

    $record = Model::get($id);
    if (!$record)
    {
        return $this->error('Record not found');
    }

    return $this->response($record);
}

// ❌ WRONG - Don't instantiate storage directly
$storage = new ModelStorage();
$record = $storage->get($id);
```

## Base Framework (frontend) - Complete Guide

### CRITICAL: This is NOT React/Vue/JSX
Base Framework uses declarative layouts with plain JavaScript objects. Read this section carefully to avoid common mistakes.

### Core Architecture & Key Differences
- **Render UI from plain JS objects** - No templates, no JSX. Parser turns objects into DOM (browser) or HTML strings (server).
- **Children as SECOND argument** - NEVER in props: `Div({ class: 'x' }, [children])`
- **Icons passed as children** - Not as icon prop: `Icon({ size: 'sm' }, Icons.home)`
- **Lists use map/for props** - Not regular `.map()`: `Ul({ map: [items, (item) => Li(item)] })`
- **Data binding with bind** - Not value + onChange: `Input({ bind: 'username' })`
- **Reactive Data object** - Not useState: `this.data = new Data({ count: 0 })`
- **Component instances** - Always `new Component()`, never `new Atom()`

### CRITICAL Common Mistakes (READ THIS FIRST)
1. **DON'T use templates or JSX** - Base uses plain JavaScript objects for layouts
2. **DON'T call `render()` directly** - Components call it internally; you return layout objects from `render()`
3. **DON'T mutate props** - Props are read-only; use `this.data` or `this.state` for mutable values
4. **DON'T use `this.setState()`** - Use `this.state.set('key', value)` or `this.state.increment('key')`
5. **DON'T forget `new` with Components** - Always: `new MyComponent()`, never just `MyComponent()`
6. **DON'T use `new` with Atoms** - Always: `Button()`, never `new Button()`. Atoms are functions, not classes
7. **DON'T use `new` with Jot/Pod** - Call the returned class: `const MyJot = Jot({...}); new MyJot()`
8. **DON'T mix data initialization locations** - Use `setData()` for initial setup, not `beforeSetup` or constructor
9. **DON'T bind without data** - `bind` directive requires `this.data` to be initialized via `setData()`
10. **DON'T use wrong state methods** - State keys must be defined in `setupStates()` before using `increment`, `decrement`, `toggle`
11. **DON'T forget Import function form** - Use `Import(() => import('./file.js'))` not `Import('./file.js')` for bundler support
12. **DON'T use element.remove()** - Use `Html.removeElement(element)` or `Builder.removeNode(element)` for proper cleanup
13. **DON'T access DOM before afterSetup** - `this.panel` and `this.elem` are only available after `afterSetup()` lifecycle hook
14. **DON'T return arrays from render()** - Wrap multiple elements: `return { children: [elem1, elem2] }` not `return [elem1, elem2]`
15. **DON'T use `await` in render()** - Load data in lifecycle hooks, render() must be synchronous

### Layout Object Patterns (house rules)
```javascript
// Basic shape: { tag: 'div', class: 'name', children: [...] }
// Default tag is 'div' - omit for divs
{ class: 'container' }  // renders as <div class="container"></div>

// Button default type is 'button' (not 'submit')
{ tag: 'button', text: 'Click' }  // type="button" automatically

// Events (lowercase names) receive (event, parentComponent)
{
  tag: 'button',
  click(e, parent) {
    parent.doThing();
  }
}

// Watchers (watches this.data or this.state by default)
{ class: 'counter-[[count]]' }  // PREFERRED: Simple, clean
{ value: ['[[path]]', data] }  // When you need different data source
{ class: ['[[a]] [[b]]', [dataA, dataB], ([a,b]) => `${a}-${b}`] }  // Multi-source

// Conditional rendering
{ class: condition ? 'active' : null }  // Null/undefined props ignored
{ children: [condition && element, other || fallback] }  // Use logical operators

// Arrays flatten automatically
{ children: [elem1, [elem2, elem3], elem4] }  // All flatten

// Function children return layout objects
{ children: [() => ({ tag: 'span', text: 'Dynamic' })] }
```

### CRITICAL: Atom Argument Patterns
Atoms support flexible argument patterns. Children MUST be passed as second argument when it's an array:

```javascript
// ✅ CORRECT patterns
Div({ class: 'text' })                        // Props only
Div('test')                                   // Text child only
Div([Div('test')])                           // Array children only
Div({ class: 'text' }, 'test')              // Props + text
Div({ class: 'text' }, [Div('test'), Div('test2')])  // Props + array children

// ❌ WRONG - Never pass children in props
Div({ class: 'text', children: [...] })
```

### Component Basics
```javascript
import { Component, Data } from '@base-framework/base';
import { Div, Button } from '@base-framework/atoms';

class Counter extends Component {
  // 1. Initialize reactive data (runs automatically during setup)
  setData() {
    return new Data({
      count: 0,
      items: []
    });
  }

  // 2. Define state properties (runs automatically)
  setupStates() {
    return {
      isOpen: false,
      mode: 'list'
    };
  }

  // 3. Render layout (called automatically, NEVER call manually)
  render() {
    return Div({ class: 'counter' }, [
      Div('Count: [[count]]'),  // Watches this.data.count
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

// Usage: Always use 'new' with Components
new Counter()
```

### State Management Complete Guide

#### Component Data (setData)
Use for dynamic values that need reactivity:
```javascript
setData() {
  return new Data({
    name: '',           // Simple values
    count: 0,
    items: [],          // Arrays for dynamic lists
    user: { name: '' }  // Nested objects
  });
}

// Updating triggers re-render
this.data.count = 5;
this.data.items.push(newItem);
this.data.user.name = 'John';

// Helper methods
this.data.set('count', 5);
this.data.set({ count: 5, name: 'test' });
this.data.get('user.name');
this.data.push('items', item);
this.data.splice('items', index, count);
this.data.refresh('key');  // Trigger watchers without changing value
this.data.delete('key');
```

#### Component States (setupStates)
Use for discrete state values (modes, flags):
```javascript
setupStates() {
  return {
    isOpen: false,        // Boolean flags
    view: 'list',        // String modes: 'list' | 'grid' | 'table'
    tab: 'overview'      // Tab selection
  };
}

// State helper methods (ONLY work on keys defined in setupStates)
this.state.set('isOpen', true);
this.state.toggle('isOpen');          // Flip boolean
this.state.increment('count', 2);     // Add to number (default +1)
this.state.decrement('count', 1);     // Subtract from number (default -1)
```

#### Global State (StateTracker)
```javascript
import { StateTracker } from '@base-framework/base';

// Create global state
const appState = StateTracker.create('app', { user: null, theme: 'light' });

// Access in components
setupStateTarget() {
  this.state = StateTracker.get('app');
}

// All state methods work
this.state.set('theme', 'dark');
```

### Directives Complete Cookbook

#### bind - Two-Way Data Binding
```javascript
// Text input (binds to this.data.form.name)
Input({ type: 'text', bind: 'form.name' })

// Checkbox (binds to boolean)
Input({ type: 'checkbox', bind: 'form.accepted' })

// Radio buttons
Input({ type: 'radio', name: 'color', value: 'red', bind: 'form.color' })

// Select with options
Select({ bind: 'form.color' }, [
  Option({ value: 'red' }, 'Red'),
  Option({ value: 'blue' }, 'Blue')
])

// Custom attribute binding
A({ bind: 'href:link.url' })  // Binds to href instead of value

// With filter/transform
Input({ bind: ['count', (v) => Math.round(v)] })

// One-way binding (element → data only)
Input({ oneway: 'propPath' })

// IMPORTANT: bind requires this.data to be set via setData()
```

#### map - Render Lists from Arrays
```javascript
// Basic list rendering
Ul({ map: [items, (item, index) => Li(item.name)] })

// With component data (reactive)
Div({ map: [this.data.items, (item) => ItemCard(item)] })

// Callback signature: (item, index)
Ul({ map: [items, (item, i) => Li({ key: item.id }, `${i}: ${item.name}`)] })

// NEVER use regular JavaScript .map() for reactive lists
// ❌ WRONG: Ul([items.map(item => Li(item))])
// ✅ CORRECT: Ul({ map: [items, (item) => Li(item)] })
```

#### for - Repeat Element N Times
```javascript
// Repeat 5 times
Div({ for: [5, (i) => Div(`Item ${i}`)] })

// With reactive count
Div({ for: [['[[count]]', this.data], (i) => Span(i)] })
```

#### if - Conditional Rendering
```javascript
// Basic conditional
Div({ if: [() => condition, Div('Shown')] })

// With data watcher
Div({ if: [['[[isVisible]]', this.data], Div('Visible')] })

// NOTE: Use regular JavaScript for simpler cases
{ children: [condition && layout] }
```

#### Watchers - Reactive Display
```javascript
// Simple property watch (watches this.data.status)
{ class: 'status-[[status]]' }

// Multiple properties
{ text: 'User: [[name]] Age: [[age]]' }

// Deep paths
{ text: '[[user.profile.name]]' }

// In arrays
{ class: ['theme-[[theme]]', 'page'] }
```

### Atoms (Reusable Layouts)
```javascript
import { Atom } from '@base-framework/base';
import { Button as BaseButton } from '@base-framework/atoms';

// Create reusable atoms
const Button = Atom((props, children) => (
  BaseButton({
    type: 'button',
    ...props,
    class: `base-classes ${props.class || ''}`
  }, children)
));

// Call without 'new'
Button({ class: 'primary', click: handler }, 'Click Me')
Button('Text only')
Button({ class: 'btn' })
Button({ class: 'btn' }, [Icon({ size: 'sm' }, Icons.plus), 'Add'])

// ❌ WRONG: new Button()  - Never use 'new' with Atoms
// ✅ CORRECT: Button()
```

### Jot & Pod (Functional Components)
```javascript
import { Jot, Pod } from '@base-framework/base';

// Jot - Lightweight components
const MyJot = Jot({
  setData() {
    return new Data({ count: 0 });
  },
  render() {
    return Div('Count: [[count]]');
  }
});

// Instantiate: new MyJot() NOT new Jot({})
new MyJot()

// Pod - Jot with built-in state
const Counter = Pod({
  states: { count: 0 },  // Equivalent to setupStates()
  render() {
    return Div([
      Div('Count: [[count]]'),
      Button({ click: () => this.state.increment('count') }, '+')
    ]);
  }
});

new Counter()
```

### Lifecycle Execution Order
1. `onCreated()` - component created, props available, NO DOM
2. `beforeSetup()` - before render, good for computed props
3. `setData()` - initialize reactive data (automatic)
4. `setupStates()` - define state properties (automatic)
5. `setupStateTarget()` - connect to global state (automatic if defined)
6. `render()` - return layout object (automatic, NEVER call manually)
7. `afterSetup()` - DOM created but not in document, `this.panel` available
8. `afterRender()` - alias for afterSetup
9. `afterLayout()` - DOM in document, safe for measurements/animations
10. `beforeDestroy()` - cleanup before removal
11. `onDestroyed()` - final cleanup after removal

### HTTP Requests (Ajax Module)
```javascript
import { Ajax } from '@base-framework/base';

// Shorthand methods (recommended)
Ajax.get('/api/users').then(data => console.log(data));
Ajax.post('/api/users', { name: 'John' }).then(data => console.log(data));
Ajax.put('/api/users/123', { name: 'Jane' });
Ajax.delete('/api/users/123');

// Object syntax for advanced options
Ajax({
  url: '/api/users',
  method: 'POST',
  data: { name: 'John' },
  responseType: 'json',  // 'json', 'text', 'blob', 'arraybuffer'
  headers: { 'X-Custom': 'value' },
  success: (data) => console.log(data),
  error: (xhr) => console.error(xhr.status)
});

// In components
class UserList extends Component {
  onCreated() {
    Ajax.get('/api/users').then(users => {
      this.data.set('users', users);
    });
  }
}
```

### Routing Complete Guide
```javascript
import { router, NavLink } from '@base-framework/base';

// 1. Setup router FIRST
router.setup('/base-url/', 'App Title');

// 2. Route Directive (renders ALL matching routes)
{
  route: [
    { uri: '/users', component: UsersList },
    { uri: '/users/:id', component: UserDetail }
  ]
}

// 3. Switch Directive (renders FIRST match only)
{
  switch: [
    { uri: '/login', component: Login },
    { uri: '/dashboard', component: Dashboard },
    { component: NotFound }  // No uri = default/fallback
  ]
}

// 4. Route Patterns
// Exact: '/users' - matches only /users
// Wildcard: '/users*' - matches /users, /users/123, /users/123/edit
// Required param: '/users/:id' - matches /users/123, extracts id: '123'
// Optional param: '/users/:id?' - matches /users and /users/123
// Multi-params: '/users/:id/posts/:postId?*'

// 5. Access route data in components
class UserDetail extends Component {
  render() {
    // this.route is automatically injected
    const userId = this.route.id;
    return Div('User ID: [[id]]');  // Watches this.route.id
  }
}

// 6. Lazy loading routes
{
  switch: [
    { uri: '/heavy', import: () => import('./components/heavy.js') }
  ]
}

// 7. NavLink Component
new NavLink({
  href: '/users',
  text: 'Users',
  exact: true,        // false = matches /users*
  activeClass: 'active'
})

// 8. Programmatic navigation
router.navigate('/users/123', { data: 'optional' }, false);  // replace?
```

### Dynamic Module Loading (Import)
```javascript
import { Import } from '@base-framework/base';

// In layouts (function form - works with bundlers)
{ children: [Import(() => import('./components/heavy.js'))] }

// With dependencies (load CSS/JS before module)
Import({
  src: () => import('./components/Chart.js'),
  depends: [
    './styles/chart.css',
    './vendor/chart-lib.js'
  ],
  callback: (module) => console.log('Loaded:', module)
})

// Route-based lazy loading
{
  switch: [
    { uri: '/dashboard', component: Import(() => import('./pages/Dashboard.js')) },
    { uri: '/profile', component: Import(() => import('./pages/Profile.js')) }
  ]
}

// CRITICAL: Always use function form for bundler support
// ❌ WRONG: Import('./file.js')  - Won't code-split
// ✅ CORRECT: Import(() => import('./file.js'))
```

## Base UI Library - Complete Guide

### Package Structure & Imports
```javascript
// Framework core
import { Atom, Component, Data, Jot, Pod } from '@base-framework/base';

// DOM elements
import { Div, Button, Input, I, Ul, Li, H5, P, Table } from '@base-framework/atoms';

// Reactive utilities
import { On, OnState, OnStateOpen, UseParent } from '@base-framework/atoms';

// UI components (organized by Atomic Design)
import { Icon, Badge, Alert } from '@base-framework/ui/atoms';
import { Form, Dropdown, Modal, DatePicker } from '@base-framework/ui/molecules';
import { DataTable, Calendar, TabGroup } from '@base-framework/ui/organisms';
import { Page, BasicPage, SidebarMenuPage } from '@base-framework/ui/pages';

// Icons (ALWAYS import both)
import { Icons } from '@base-framework/ui/icons';
import { Icon } from '@base-framework/ui/atoms';

// Utils
import { Format, DateTime, ImageScaler } from '@base-framework/ui/utils';
```

### CRITICAL: Icon Usage Patterns

Icons are SVG strings from Heroicons library. Three ways to use them:

#### Method 1: Icon Atom (RECOMMENDED)
```javascript
import { Icon } from '@base-framework/ui/atoms';
import { Icons } from '@base-framework/ui/icons';

// Icon as child (second argument), props first
Icon({ size: 'sm' }, Icons.home)
Icon({ size: 'md', class: 'text-blue-500' }, Icons.chat.default)

// Common icon paths
Icons.home
Icons.star
Icons.help
Icons.plus
Icons.chat.default
Icons.arrows.left
Icons.adjustments.vertical
```

#### Method 2: Raw I Element
```javascript
import { I } from '@base-framework/atoms';
import { Icons } from '@base-framework/ui/icons';

// Use html prop for SVG string
I({ html: Icons.home, class: 'w-6 h-6' })
I({ html: Icons.arrows.right, class: 'w-4 h-4 text-blue-500' })
```

#### Method 3: Button with Icon
```javascript
import { Button } from '@base-framework/ui/atoms';
import { Icons } from '@base-framework/ui/icons';

// Icon prop with variant
Button({ variant: 'withIcon', icon: Icons.plus }, 'Add')
Button({ variant: 'withIcon', icon: Icons.arrows.right, position: 'right' }, 'Next')
```

#### CRITICAL Icon Mistakes
```javascript
// ❌ WRONG patterns
Icon(Icons.home)                    // Missing props object
Icon({ icon: Icons.home })          // Wrong prop name, pass as child
I(Icons.home)                       // Must use html prop
Icons['home']                       // Use dot notation

// ✅ CORRECT patterns
Icon({ size: 'sm' }, Icons.home)
I({ html: Icons.home })
Button({ variant: 'withIcon', icon: Icons.plus }, 'Text')
Icons.home  // Dot notation
```

### Component Types & When to Use

#### Use Atom for:
- Stateless UI elements (buttons, badges, icons, labels)
- Simple compositions of other atoms
- Variants of existing atoms

```javascript
export const Badge = Atom((props, children) => (
  Span({
    ...props,
    class: `inline-flex rounded-full px-2.5 py-0.5 ${props.class || ''}`
  }, children)
));
```

#### Use Component for:
- Components with internal state (Data or setupStates)
- Components needing lifecycle methods
- Complex interactions requiring methods

```javascript
export class Counter extends Component {
  setData() {
    return new Data({ count: 0 });
  }

  increment() {
    this.data.count++;
  }

  render() {
    return Div([
      Button({ click: () => this.increment() }, '+'),
      Span([On('count', (count) => count)])
    ]);
  }
}
```

#### Use Jot for:
- Components with external two-way binding
- Reusable inputs/controls with value/change pattern

```javascript
const Toggle = Jot((checked, setChecked) => (
  Button({
    click: () => setChecked(!checked),
    class: checked ? 'bg-primary' : 'bg-muted'
  }, checked ? 'ON' : 'OFF')
));
```

### Tailwind & Theming
- **Tailwind v4** is used throughout the project. It scans `src/**/*.{js,ts,jsx,tsx}` automatically.
- **Shadcn-based Theme**: The platform uses a theme based on shadcn for colors. Use semantic tokens: `primary`, `secondary`, `destructive`, `warning`, `muted`, `accent`, `popover`, `card`, `border`, `foreground`.
- **Dark Mode**: Dark mode is `media` based.
- **Design Tokens**: Use existing tokens like `text-muted-foreground`, `bg-muted/10`, `border`, `ring`.

### Base UI Library (Pre-built Components)
**STOP! Do not build these from scratch.** The `@base-framework/ui` package already contains components for all these categories. Import and use them:

- **Atoms**: `Button`, `Badge`, `Avatar`, `Skeleton`, `Tooltip`, `Icon`
- **Inputs**: `Input`, `Select`, `Checkbox`, `Switch`, `Textarea`, `Combobox`
- **Feedback**: `Alert`, `Progress`, `Spinner`, `Toast` (Notifications)
- **Overlay**: `Modal`, `Dialog`, `Drawer`, `Popover`, `DropdownMenu`
- **Navigation**: `Tabs`, `Breadcrumb`, `Pagination`, `Sidebar`
- **Data Display**: `Card`, `Table` (DataTable), `List`, `Calendar`, `EmptyState`

Example imports:
```javascript
import { Button, Badge, Input } from '@base-framework/ui/atoms';
import { Card, Modal, Drawer } from '@base-framework/ui/molecules';
import { DataTable, Calendar } from '@base-framework/ui/organisms';
```

### Common UI Patterns

#### Alert Component
```javascript
import { Div, H5, P, I } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Icons } from '@base-framework/ui/icons';

export const Alert = Atom(({ title, description, icon, type = 'default' }) => {
  const styles = {
    default: { bgColor: 'bg-gray-50', iconColor: 'text-gray-500' },
    destructive: { bgColor: 'bg-red-50', iconColor: 'text-red-500' }
  }[type];

  return Div({ class: `flex p-4 border rounded-lg ${styles.bgColor}` }, [
    icon && Div({ class: `flex h-6 w-6 mr-3 ${styles.iconColor}` }, [
      I({ html: icon })
    ]),
    Div({ class: 'flex flex-col' }, [
      H5({ class: 'font-semibold' }, title),
      P({ class: 'text-sm' }, description)
    ])
  ]);
});

// Usage
Alert({
  title: 'Error',
  description: 'Something went wrong',
  icon: Icons.exclamation,
  type: 'destructive'
})
```

#### Data-Driven Lists
```javascript
// Static arrays - use map
Ul({ map: [items, (item) => Li(item.name)] })

// Component data (reactive) - use for
Div({ for: ['items', (item, index) => ItemCard({ item, index })] })

// NEVER use regular .map() for reactive lists
// ❌ WRONG: Ul([items.map(item => Li(item))])
// ✅ CORRECT: Ul({ map: [items, (item) => Li(item)] })
```

#### Form with Binding
```javascript
class UserForm extends Component {
  setData() {
    return new Data({
      form: {
        name: '',
        email: '',
        role: 'user',
        newsletter: false
      }
    });
  }

  render() {
    return Div({ class: 'user-form' }, [
      Input({ type: 'text', placeholder: 'Name', bind: 'form.name' }),
      Input({ type: 'email', placeholder: 'Email', bind: 'form.email' }),
      Select({ bind: 'form.role' }, [
        Option({ value: 'user' }, 'User'),
        Option({ value: 'admin' }, 'Admin')
      ]),
      Label([
        Input({ type: 'checkbox', bind: 'form.newsletter' }),
        Span('Subscribe to newsletter')
      ]),
      Button({ click: () => this.handleSubmit() }, 'Submit'),
      // Preview with watchers
      Pre('Name: [[form.name]]\nEmail: [[form.email]]')
    ]);
  }

  handleSubmit() {
    console.log('Form data:', this.data.form);
  }
}
```

### Watchers and Subscriptions

#### On - Watch Data Changes
```javascript
render() {
  return Div([
    // Watch single property
    On('count', (value) => {
      console.log('Count changed:', value);
    }),

    // Watch nested property
    On('user.name', (name) => {
      this.updateProfile(name);
    }),

    // Display watched value
    Span({ onState: ['count', (count) => `Count: ${count}`] })
  ]);
}
```

#### OnState - Watch State Changes
```javascript
render() {
  return Div([
    OnState('isOpen', (isOpen) => {
      if (isOpen) {
        this.loadContent();
      }
    })
  ]);
}
```

#### OnStateOpen - Run Once When State Becomes True
```javascript
render() {
  return Div([
    OnStateOpen('isVisible', () => {
      this.startAnimation();
    })
  ]);
}
```

#### UseParent - Access Parent Component
```javascript
const ChildAtom = Atom((props) => (
  Div([
    UseParent(({ data, state, panel }) => {
      // Access parent's data/state
      panel.selectItem(props.id);
      return null;
    })
  ])
));
```

### DO/DON'T Rules

#### ✅ DO:
- Import DOM elements from `@base-framework/atoms`
- Import Atom, Component, Data from `@base-framework/base`
- Pass children as SECOND argument: `Div({ class: 'x' }, [children])`
- Use Icons object: `import { Icons } from '@base-framework/ui/icons'`
- Use Icon atom: `Icon({ size: 'sm' }, Icons.home)`
- Use I element for icons: `I({ html: Icons.home })`
- Spread props: `{ ...defaultProps, ...props }`
- Use Tailwind semantic tokens (primary, secondary, destructive, warning, muted, accent)
- Use `map` or `for` for lists: `Ul({ map: [items, fn] })` or `Div({ for: ['items', fn] })`
- Use `bind` for two-way binding: `Input({ bind: 'username' })`
- Use `On` for data watchers: `On('count', (val) => ...)`
- Use `OnState` for state watchers: `OnState('isOpen', (val) => ...)`
- Use Data for reactive values: `new Data({ count: 0 })`
- Use setupStates for discrete states: `setupStates() { return { isOpen: false } }`

#### ❌ DON'T:
- Pass children in props: `Div({ children: [...] })`
- Use icon prop on Icon: `Icon({ icon: Icons.home })`
- Pass icon without props: `Icon(Icons.home)`
- Use React/Vue/JSX patterns
- Mutate DOM directly
- Use raw hex colors (use Tailwind tokens)
- Import Icons from wrong path
- Use regular JS map for reactive lists: `[items.map(...)]`
- Use value + onChange: use `bind` instead
- Use plain objects for reactive data: use `Data` instead
- Use useState hooks: use `Data` and `setupStates` instead

### Complete Working Examples

#### Example 1: Simple Counter
```javascript
import { Component } from '@base-framework/base';
import { Div, Button, Span } from '@base-framework/atoms';
import { On } from '@base-framework/atoms';

class Counter extends Component {
  setupStates() {
    return { count: 0 };
  }

  render() {
    return Div({ class: 'counter' }, [
      Span([On('count', (count) => `Count: ${count}`)]),
      Button({ click: () => this.state.increment('count') }, 'Increment'),
      Button({ click: () => this.state.decrement('count') }, 'Decrement')
    ]);
  }
}
```

#### Example 2: Todo List with Map
```javascript
import { Component, Data } from '@base-framework/base';
import { Div, Input, Button, Ul, Li } from '@base-framework/atoms';

class TodoList extends Component {
  setData() {
    return new Data({
      newTodo: '',
      todos: [
        { id: 1, text: 'Learn Base', done: false },
        { id: 2, text: 'Build app', done: false }
      ]
    });
  }

  render() {
    return Div({ class: 'todo-list' }, [
      Input({ type: 'text', bind: 'newTodo', placeholder: 'New todo...' }),
      Button({ click: () => this.addTodo() }, 'Add'),
      Ul({ map: [this.data.todos, (todo, index) => (
        Li({ class: todo.done ? 'done' : '' }, [
          Input({
            type: 'checkbox',
            checked: todo.done,
            change: (e) => {
              this.data.todos[index].done = e.target.checked;
              this.data.refresh('todos');
            }
          }),
          Span(todo.text),
          Button({ click: () => this.removeTodo(index) }, '×')
        ])
      )] })
    ]);
  }

  addTodo() {
    if (!this.data.newTodo.trim()) return;
    this.data.push('todos', {
      id: Date.now(),
      text: this.data.newTodo,
      done: false
    });
    this.data.newTodo = '';
  }

  removeTodo(index) {
    this.data.splice('todos', index, 1);
  }
}
```

#### Example 3: Routing App
```javascript
import { Component, router, NavLink } from '@base-framework/base';
import { Div, Nav, Main, H1, P } from '@base-framework/atoms';

// Setup router FIRST
router.setup('/app/', 'My App');

class HomePage extends Component {
  render() {
    return Div({ class: 'home' }, [H1('Home')]);
  }
}

class UserDetail extends Component {
  render() {
    return Div({ class: 'user-detail' }, [
      H1('User Details'),
      P('User ID: [[id]]')  // Watches this.route.id
    ]);
  }
}

class App extends Component {
  render() {
    return Div({ class: 'app' }, [
      Nav([
        new NavLink({ href: '/', text: 'Home', exact: true }),
        new NavLink({ href: '/users', text: 'Users' })
      ]),
      Main({
        switch: [
          { uri: '/', component: HomePage },
          { uri: '/users/:id', component: UserDetail }
        ]
      })
    ]);
  }
}
```

### Project wiring
- Aliases in `vite.config.js`: `@components`, `@pages`, `@modules`, `@shell`. Dev servers proxy `/api` using `generateUrls(isDev)`.
- Environment: use relative `/api/...`; Developer app exposes `process.env.VITE_API_URL`.
- Styling: Tailwind v4 via `@tailwindcss/vite`; pass class strings directly via `class` prop.

  ## More from Developer docs (quick refs)
  - Modules & API: Each module registers routes in `modules/*/Api/api.php` and exposes controllers under `modules/*/Controllers/*`. See the Developer docs “Modules” and “API”.
  - HTTP requests: Controller methods receive `Proto\Http\Router\Request`; use `$request->input('key')` and `$this->getRequestItem($request)` to parse/validate payloads.
  - Validation: Prefer controller `validate()`/`validateRules()` or `$request->validate([...])` with rules like `string:255|required`, `email`, `int`. See “Validation”.
  - Storage & DB: Use builder (`select/where/orderBy/groupBy/limit`) and `find/findAll` closures for ad‑hoc queries; filters accept raw SQL, operators, and bound arrays. See “Storage” and “Database”.
  - Seeders: Initialize sample/reference data via module seeder classes and run alongside migrations (see “Seeders”).
  - Dispatch/Events: Send Email/Text/Push via `common/Email/*`, `common/Text/*`, `common/Push/*`; controllers/services can dispatch notifications (see “Dispatch” and “Events”).
  - WebSockets: Dev servers proxy WS (`ws: true`) in `apps/developer/vite.config.js`. Keep WS endpoints relative (e.g., `/api/ws/...`) and let the proxy route.
  - Tests: Place Unit tests under `common/Tests/Unit`, Feature tests under `common/Tests/Feature` and `modules/*/Tests/Feature`; run locally with phpunit.

## Testing (backend)
- Framework auto-wraps each test in a transaction (no setUp/tearDown needed). Just extend `Proto\Tests\Test` and write tests—changes rollback automatically.
- Factories: `Model::factory()->create()` (persisted), `->make()` (unpersisted), `->count(5)->create()` (bulk), `->state('admin')->create()` (with state).
- Assertions: `$this->assertDatabaseHas('table', [...])`, `assertDatabaseMissing(...)`, `assertDatabaseCount('table', 5)`.
- Retrieval in tests: Always use `Model::get($id)`, `Model::getBy(['field' => $val])`, `Model::fetchWhere([...])`, or `$model->refresh()` (transaction-safe). **Avoid custom static methods**—they may create new connections outside the test transaction → deadlocks/timeouts.
- Relationships: Create parent records first or use `->for(ParentModel::factory())`. Foreign keys stay enforced (constraint errors = good, they catch real bugs).
- Seeders: Set `protected array $seeders = [SomeSeeder::class];` for data that auto-rollbacks.
- Anti-patterns: Don't disable foreign key checks (`SET FOREIGN_KEY_CHECKS=0`), don't manually delete data in `tearDown()`, don't call custom `getById()` methods in tests.
- Disable transactions (rare): `protected bool $useTransactions = false;` then handle cleanup manually.
- Run: `php vendor/bin/phpunit` (all), `--filter testName` (one test), `--testdox` (readable names), `--testsuite Feature` (suite).

