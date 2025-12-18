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
- Migrations are PHP classes under `common/Migrations` or `modules/*/Migrations`. They're executed by `infrastructure/scripts/run-migrations.php` (entrypoint runs them when `AUTO_MIGRATE=true`).
- Files: writable volumes are mounted at `public/files` and `common/files` (see `infrastructure/docker-compose.yaml`).

## Proto coding patterns (AI quick recipes)
- Controllers
  - Extend `Proto\Controllers\ResourceController` for CRUD or `ApiController` for custom endpoints.
  - Bind a model: `class UserController extends ResourceController { public function __construct(protected ?string $model = User::class){ parent::__construct(); } }`
  - Helpers: `$this->getRequestItem(Request)`, `$this->getResourceId(Request)`, `$this->response($data)`, `$this->error($message)`.
  - Validation: implement `protected function validate(): array` or call `$this->validateRules($data, ['name' => 'string:255|required'])` or `$request->validate([...])`.
  - Pass-through: public methods on the model (and its storage) are auto-wrapped in a Response when invoked via the controller.
- Routing
  - Register in `modules/*/Api/api.php`: `router()->resource('users', Modules\User\Controllers\UserController::class);`
  - Add custom routes to controller methods as needed via the module router.
- Query patterns
  - Simple: `User::getBy(['name' => $name])`, `User::fetchWhere(['status' => 'active'])`.
  - Builder: `User::where(['name' => $name])->orderBy('id DESC')->groupBy('id')->fetch();`
  - Storage closures: `$this->storage()->findAll(fn($sql,&$p)=>($p[]='active',$sql->where('status = ?')->orderBy('status DESC')));`
- Validation rules
  - Format: `'type[:max]|required'` (e.g., `'string:255|required'`, `'email|required'`, `'int|required'`).
  - Common types: `int,float,string,email,ip,phone,mac,bool,url,domain`.
- Migrations
  - Place classes under `common/Migrations` or `modules/*/Migrations`; executed by the migration runner.
  - From docs: `Proto\Database\Migrations\Guide` supports `run()` and `revert()` when invoked from scripts.
- File storage
  - Use `Proto\Utils\Files\Vault` (see Developer app docs) for storing/retrieving files; buckets map to `public/files` or remote drivers.

## Models & Storage (backend)
- Models
  - Extend `Proto\Models\Model`; set `protected static ?string $tableName`, `protected static array $fields`, optional `protected static array $fieldsBlacklist`, `protected static string $idKeyName = 'id'`.
  - Pre/post hooks: `augment(mixed $data): mixed` to sanitize before persist, `format(?object $data): ?object` to shape API output.
  - Relations (lazy): `$this->hasMany(Post::class)`, `$this->hasOne(Profile::class)`, `$this->belongsTo(User::class)`, `$this->belongsToMany(Role::class, 'pivot', 'fk', 'rk')`.
  - Eager joins (builder): define `protected static function joins($builder): void { Role::one($builder)->on(['id','userId'])->fields('role'); }`.
  - Pass-through: undeclared model/storage public methods auto-wrap in Response via controllers; bypass via `static::$storageType::methodName()`.
- Storage
  - Extend `Proto\Storage\Storage` (name ends with `Storage`); optional `protected string $connection = 'default'`.
  - Query builder: `$sql = $this->table()->select()->where("status = 'active'"); $rows = $this->fetch($sql);`
  - Filters: mixed formats supported, e.g., `["a.id = '1'"], ["a.id", $id], ["a.id", ">", $id], ["created_at BETWEEN ? AND ?", [$d1,$d2]]`.
  - Ad-hoc queries: `findAll(fn($sql,&$p)=>($p[]='active',$sql->where('status = ?')->orderBy('status DESC')));` and `find(fn($sql,&$p)=>($p[]='active',$sql->where('status = ?')->limit(1)));`.
  - Direct adapter: `$this->db->fetch('SELECT * FROM users')`; transactions via `beginTransaction/commit/rollback`.

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
  - Register routes in `modules/Feature/Api/api.php` (use `router()->resource(...)` or custom routes)
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

## Base Framework (frontend) patterns

### Core Architecture (CRITICAL)
- **No JSX/Templates**: Use plain JS objects (`{ tag: 'div', class: 'foo' }`).
- **Atoms return Objects**: They return `{ tag, ... }`, NOT DOM elements. Never call `.appendChild()` on an atom result.
- **Instantiation**:
  - Components: `new MyComponent()` (Always use `new`).
  - Atoms: `Div()` (Never use `new`).
- **State**: Use `this.state.set('key', val)` or `this.data.prop = val`. NEVER `this.setState()`.
- **Props**: Read-only. Do not mutate.

### Atoms & Layouts
- **Signature**: `Atom((props, children) => ({ tag: 'div', ...props, children }))`.
- **Usage**:
  - Props only: `Div({ class: 'red' })`
  - Children only: `Div([ Span('text') ])` (Always wrap multiple children in Array).
  - Both: `Div({ class: 'red' }, [ Span('text') ])` (Children is 2nd arg).
- **Events**: `click(event, parent) { ... }`. Always receive `parent` component as 2nd arg.
- **Conditionals**:
  - `On('prop', (val) => val ? Div() : null)` (Must return Atom object or null).
  - `If('prop', 'value', () => Div())`.

### Components
- Extend `Component`. Implement `render() { return Div(...); }`.
- **Data**: Initialize in `setData()`. Use `Data` (deep) or `SimpleData` (shallow).
- **State**: Initialize in `setupStates()`. Access via `this.state`.
- **Lifecycle**: `onCreated`, `beforeSetup`, `afterSetup` (DOM ready), `beforeDestroy`.

### Directives
- **Bind**: `bind: 'prop'` (two-way).
- **Map**: `map: ['[[items]]', (item) => Div(item.name)]` (Efficient list rendering).
- **Route**: `route: { uri: '/path', component: MyComponent }`.
- **Switch**: `switch: [ { uri: ... }, ... ]` (Renders first match).
- **Watch**: `[[prop]]` in strings updates automatically.

### UI Library & Icons (CRITICAL)
- **Imports**:
  - Core: `import { Atom, Component, Data } from '@base-framework/base';`
  - DOM Atoms: `import { Div, Button } from '@base-framework/atoms';`
  - UI Components: `import { Button as UiButton } from '@base-framework/ui/atoms';`
  - Icons: `import { Icons } from '@base-framework/ui/icons';`
  - Icon Atom: `import { Icon } from '@base-framework/ui/atoms';`
- **Icon Usage**:
  - ✅ `Icon({ size: 'sm', class: 'text-red' }, Icons.home)`
  - ❌ `Icon(Icons.home)` (Wrong)
  - ❌ `Icon({ icon: Icons.home })` (Wrong)
- **Tailwind**: Use standard utility classes.

### Common Mistakes to Avoid
1. **Forgetting Children Array**: `Div(Span(), Span())` ❌ -> `Div([Span(), Span()])` ✅
2. **Wrong Event Signature**: `click(e) {}` ❌ -> `click(e, parent) {}` ✅
3. **Mutating Props**: Use `this.data` or `this.state` instead.
4. **Importing from wrong package**: Check imports carefully against the list above.

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

