# Copilot Instructions — Index

**Goal**: Build resilient, scalable, maintainable, and secure code with minimal errors and without human intervention.

This file is intentionally short. Domain-specific guidance lives in `[/.github/instructions/](./instructions/)` and is auto-loaded by VS Code based on the files you are editing or by description match. **Read the relevant focused file before working in that area** — do not guess or skim. Each focused file is the single source of truth for its domain.

---

## Non-Negotiable Project Rules (always apply)

These rules apply to **all** code in **all** files. Violations must be fixed before considering a task complete.

### 1. ZERO TOLERANCE: No Vertical Alignment — ever, in any form

Never pad values, keys, operators, types, or comments with extra spaces to make them line up into visual columns. This rule has no exceptions and no edge cases.

This prohibition covers every possible form, including:

- Object or array literal properties padded with spaces so their values line up
- Variable assignments padded so `=` signs line up
- Object keys padded so `:` or `=>` operators line up
- `@param`, `@type`, `@returns`, `@var` doc block columns aligned with spaces
- Inline comments padded so they start in the same column
- String values padded with trailing spaces to align symbols on the next token
- Any other use of extra whitespace whose sole purpose is visual column alignment

**WRONG — object array with padded properties:**

```js
{ value: 'white',       label: 'White',  hex: '#F8F8F8' },
{ value: 'pearl_white', label: 'Pearl',  hex: '#EEE8D5' },
```

**CORRECT — single space after each key:**

```js
{ value: 'white', label: 'White', hex: '#F8F8F8' },
{ value: 'pearl_white', label: 'Pearl', hex: '#EEE8D5' },
```

If you produce vertically aligned code you must fix it before finishing.

### 2. Indentation

Use **tabs** for indentation. Use 4 spaces only for column alignment within a single token (never to align across lines). Never mix spaces and tabs for indentation.

### 3. Engineering Discipline

- **Single Responsibility Principle**: functions and methods do one thing well
- **SOLID** for classes
- **Fail gracefully**: proper error handling and logging — never silent failures
- **Database**: tables normalized to at least 3NF
- **Security**: free from OWASP Top 10 vulnerabilities — fix insecure code immediately
- **Don't over-engineer**: only make changes that are directly requested or clearly necessary
- **Don't add docstrings, comments, or type annotations to code you didn't change**
- **Don't add error handling for scenarios that can't happen** — only validate at system boundaries
- **Don't create helpers or abstractions for one-time operations**

### 4. Brace Style (PHP and JavaScript)

Opening braces **always on a new line** for classes, functions, methods, if/else, loops, try/catch.

**Exception (JavaScript Atoms only)**: an arrow-function `Atom(...)` body that is a single expression may use the inline `=> (` form. See `frontend-base-framework.instructions.md`.

### 5. Theme Tokens (Frontend)

Never use hardcoded colors (`text-white`, `bg-zinc-900`, `#0b0b0c`, `border-white/10`, `bg-green-500`). Always use Rally semantic theme tokens (`text-foreground`, `bg-background`, `bg-card`, `bg-surface-2`, `border-border`, `border-border/50`, `bg-success`, `bg-destructive`, etc.). See `frontend-ui-components.instructions.md`.

---

## Stack at a Glance

- **Backend**: PHP 8.4 monolith using **Proto Framework**. Entry: `public/api/index.php`.
- **Frontend**: Vite-based apps in `apps/{crm,developer,main}` using **Base Framework** (NOT React/Vue/JSX — plain JS object trees).
- **Infrastructure**: Dockerized (Web/PHP, MariaDB on host port 3307, Redis on host port 6380) via `infrastructure/docker-compose.yaml`.

### Code Layout

- `modules/`* — feature modules (domain logic). Supports nested feature modules.
- `common/*` — shared framework glue, base classes, configs.
- `public/*` — HTTP entrypoints and assets.
- `apps/*` — independent frontend applications proxying `/api` to backend.

### Autoloading

- PSR-4: `Modules\` → `modules/`, `Common\` → `common/`
- Migrations: classmapped from `common/Migrations` and recursively discovered from `modules/*/Migrations` (up to 6 levels deep)

---

## Focused Instruction Files

Each file is **the** authoritative reference for its domain. When you start work on a topic below, **read the matching file first**. Do not rely on prior memory.


| File                                                                                                                 | When to read                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[instructions/project-overview.instructions.md](./instructions/project-overview.instructions.md)`                   | Project structure, autoloading, code layout overview                                                                                                                                                                                                                                                                                                                                                                                |
| `[instructions/php-code-style.instructions.md](./instructions/php-code-style.instructions.md)`                       | Any PHP file — strict types, brace style, doc blocks, references, spacing                                                                                                                                                                                                                                                                                                                                                           |
| `[instructions/proto-controllers-routing.instructions.md](./instructions/proto-controllers-routing.instructions.md)` | Controllers, ResourceController hooks (`modifyAddItem`, `modifyUpdateItem`, `enrichRow`, `enrichRows`), `$routeParams` / `$filterParams` / `$enrichUserFields` / `$scopeToUser` / `$serviceClass`, `getAllInputs()` contract, file uploads via `handleFileUpload` / `handleMediaUpload`, BatchEnrichmentTrait, SyncController/SyncableTrait, Modules, nested feature modules, Routing, middleware, CSRF default mutation middleware |
| `[instructions/proto-models-storage.instructions.md](./instructions/proto-models-storage.instructions.md)`           | Models, `$fields`, `$immutableFields`, `$dataTypes` (PointType/JsonType), eager joins via JoinBuilder (`belongsTo`/`hasOne`/`hasMany`/`belongsToMany`), lazy relationships, `getWithoutJoins()` / `fetchWhereWithoutJoins()`, atomic counters, PivotModel, Storage filter arrays + `Filter::exists` / `Filter::aliased` / `Filter::condition`, query builder, joins/where/limit/select pitfalls, UnionQuery                         |
| `[instructions/proto-migrations.instructions.md](./instructions/proto-migrations.instructions.md)`                   | Migrations — naming convention (`YYYY-MM-DDTHH.MM.SS.MICROSECONDS_ClassName.php`), snake_case columns, FK 64-char limit, all field types and modifiers                                                                                                                                                                                                                                                                              |
| `[instructions/proto-services-auth.instructions.md](./instructions/proto-services-auth.instructions.md)`             | Services, ServiceResult, built-in service traits (ToggleLikeTrait, TogglePivotTrait, VoteableTrait, AudienceTargetingTrait, LocationFilterTrait), Validation, Auth Gates, Policies (extending `Common\Auth\Policies\Policy`, `$type`, `isSignedIn()`, `ownsResource()`, `matchesRouteUser()`, method signatures)                                                                                                                    |
| `[instructions/frontend-base-framework.instructions.md](./instructions/frontend-base-framework.instructions.md)`     | Any `apps/**/*.js` — Base Framework core philosophy, code style, file organization, Component Decomposition Rules (1–6, including 20-line threshold), Pages/Organisms/Molecules/Atoms/Hybrid Atoms, Data binding, lists (`for`/`map`), state, conditionals, routing, Ajax, dynamic imports                                                                                                                                          |
| `[instructions/frontend-ui-components.instructions.md](./instructions/frontend-ui-components.instructions.md)`       | Any `apps/**/*.js` — Base UI components (Button variants — no `default`, Avatar from molecules, Universal Icon System), Rally design tokens, shared `@components/` library (RowSkeleton, PillTabBar, PillLinkBar, StickyFilterBar, UserRow, status tokens), TimeFrame, Lists (ScrollableList/ScrollableDataTable), Models with built-in xhr methods (`all()` contract — never override for filter/search/sort), Modules System      |
| `[instructions/testing-backend.instructions.md](./instructions/testing-backend.instructions.md)`                     | Tests, factories, seeders — `$this->faker()` method-call gotcha, `state(fn() => [])`, enum-matching, transactions, `assertDatabaseCount` scoping, table names vs class names, eager-join testing helpers (`safeGet`, `refreshModelWithoutJoins`), camelCase fields                                                                                                                                                                  |
| `[instructions/anti-patterns.instructions.md](./instructions/anti-patterns.instructions.md)`                         | Comprehensive WRONG → CORRECT tables for backend and frontend. **Cross-reference before submitting changes.**                                                                                                                                                                                                                                                                                                                       |
| `[instructions/config-events-dispatch.instructions.md](./instructions/config-events-dispatch.instructions.md)`       | Config (`common/Config/.env`), CSRF rotation, trusted proxies, CORS whitelist, Events (local + Redis pub-sub, Storage events, SSE), Dispatch (Email, SMS via Twilio, Web Push via VAPID, user module gateways)                                                                                                                                                                                                                      |
| `[instructions/workflows.instructions.md](./instructions/workflows.instructions.md)`                                 | Setup, Docker run, Migrations runner, Generator (`/api/developer/generator`), Vite dev server, PHPUnit, File Storage / Vault uploads, debugging via `proto_error_log` table, key file paths and host port mappings                                                                                                                                                                                                                  |


---

## Required Research Before Acting

Before writing or modifying code, gather sufficient context — but do not over-explore.

1. **Match the task to a focused file above** and read it.
2. **Read existing files before modifying them**. Do not edit blind.
3. **For unfamiliar modules**, briefly inspect `modules/{ModuleName}/` structure (Models, Controllers, Api, Services, Migrations) before adding code.
4. **For backend errors**, query `proto_error_log` first (see `workflows.instructions.md`).
5. **For repeated patterns** (toggle-like, pivot toggle, vote, audience targeting, proximity filtering, batch enrichment, SSE), check whether a **built-in trait or helper** already exists (see `proto-services-auth.instructions.md` and `proto-controllers-routing.instructions.md`) before writing custom logic.

Once you have enough context to act confidently, proceed. Avoid redundant searches.

---

## Add a New Feature — Quick Pointer

**Backend (flat module)**: Controller → `Api/api.php` routes → Migrations → Tests. See `proto-controllers-routing.instructions.md`.
**Backend (nested feature)**: `modules/Parent/Feature/{Controllers,Api,Migrations}` + Gateway accessor on parent. See `proto-controllers-routing.instructions.md`.
**Frontend**: `apps/{crm|main}/src/modules/{name}/module.js` → pages/organisms/molecules/atoms → Model → register in `imported-modules.js`. See `frontend-base-framework.instructions.md` and `frontend-ui-components.instructions.md`.