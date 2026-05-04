import { Code, H4, P, Pre, Section } from "@base-framework/atoms";
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
 * ModulesPage
 *
 * This page explains how to structure and work with modules in Proto.
 * Modules are self-contained units for each major feature or domain and can
 * communicate with other modules through gateways. They can be generated via the developer code generator
 * and must be registered in the configuration.
 *
 * @returns {DocPage}
 */
export const ModulesPage = () =>
	DocPage(
		{
			title: 'Modules',
			description: 'Learn how to create, manage, and register modules in Proto.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Each feature or domain of your application should be developed as a separate module.
					Modules are self-contained units that encapsulate APIs, controllers, models, and gateways.
					They can interact with other registered modules when necessary.`
				),
				P({ class: 'text-muted-foreground' },
					`Proto supports both flat modules (traditional) and nested feature modules for organizing
					large modules with many related features.`
				)
			]),

			// Module Folder Structure
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Module Folder Structure'),
				P({ class: 'text-muted-foreground' },
					`All modules reside in their own folders inside the modules directory.
					Modules can be generated using the developer code generator, making it easy to add new features.`
				),
				CodeBlock(
`# Flat Module Structure (Traditional)
modules/
  User/
    UserModule.php
    Api/
      api.php           # /api/user
      Account/
        api.php         # /api/user/account
    Controllers/
    Models/
    Services/

# Nested Feature Module Structure (New)
modules/
  Community/
    CommunityModule.php  # Parent module class
    Main/                # Root-level module code (optional)
      Api/
        api.php          # /api/community
      Controllers/
      Models/
    Group/               # Nested feature
      Api/
        api.php          # /api/community/group
      Controllers/
      Models/
      Migrations/
    Events/              # Another nested feature
      Api/
        api.php          # /api/community/events
    Gateway/
      Gateway.php        # Parent gateway with feature access`
				)
			]),

			// Nested Feature Modules
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Nested Feature Modules'),
				P({ class: 'text-muted-foreground' },
					`For large modules with multiple related features, you can organize them as nested feature
					modules. Each feature becomes a subdirectory with its own Controllers, Models, Services, and API routes.`
				),
				P({ class: 'text-muted-foreground' },
					`Features are automatically available when the parent module is registered - no separate
					registration needed.`
				)
			]),

			// The Main Folder Convention
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'The "Main" Folder Convention'),
				P({ class: 'text-muted-foreground' },
					`For modules that need both root-level functionality AND nested features, use a Main/ folder
					to hold the root-level code. This allows /api/module to route to Main/Api/api.php while
					/api/module/feature routes to Feature/Api/api.php.`
				),
				CodeBlock(
`modules/
  User/
    UserModule.php
    Main/                 # Root user functionality
      Api/
        api.php           # /api/user
      Controllers/
        UserController.php
      Models/
        User.php
    Profile/              # Nested feature
      Api/
        api.php           # /api/user/profile
    Settings/             # Another nested feature
      Api/
        api.php           # /api/user/settings`
				)
			]),

			// URL Resolution
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'URL Resolution'),
				P({ class: 'text-muted-foreground' },
					`Proto resolves URLs in a specific order, first checking for nested features before falling
					back to flat module paths. This ensures backward compatibility with existing modules.`
				),
				CodeBlock(
`URL Resolution Order:
1. Nested Feature: modules/{Seg1}/{Seg2}/Api/{Seg3...}/api.php
2. Nested with Main: modules/{Seg1}/{Seg2}/Main/Api/{Seg3...}/api.php
3. Flat Module: modules/{Seg1}/Api/{Seg2...}/api.php
4. Main Fallback: modules/{Seg1}/Main/Api/{Seg2...}/api.php

Examples:
/api/community/group         → modules/Community/Group/Api/api.php
/api/community/group/settings → modules/Community/Group/Api/Settings/api.php
/api/user                    → modules/User/Api/api.php OR modules/User/Main/Api/api.php
/api/user/profile            → modules/User/Profile/Api/api.php`
				)
			]),

			// Module Gateway
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Module Gateway'),
				P({ class: 'text-muted-foreground' },
					`Modules can include a gateway file within a gateway subfolder. The gateway provides
					a public interface for accessing module functionality from other modules. Gateways can also support versioning
					to allow updates while maintaining backward compatibility.`
				),
				P({ class: 'text-muted-foreground' },
					`For nested feature modules, the parent gateway exposes child features as methods for hierarchical access.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Community\\Gateway;

use Modules\\Community\\Group\\Gateway\\Gateway as GroupGateway;
use Modules\\Community\\Events\\Gateway\\Gateway as EventsGateway;

/**
 * Gateway
 *
 * This will handle the community module gateway.
 * Call it from another module like:
 * modules()->community()->group()->addMember($userId, $groupId);
 * modules()->community()->events()->create($data);
 */
class Gateway
{
    public function group(): GroupGateway
    {
        return new GroupGateway();
    }

    public function events(): EventsGateway
    {
        return new EventsGateway();
    }

    public function v1(): V1\\Gateway
    {
        return new \\Modules\\Community\\Gateway\\V1\\Gateway();
    }
}`
				)
			]),

			// Example Module
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Example Module'),
				P({ class: 'text-muted-foreground' },
					`Below is an example module that demonstrates how to encapsulate a feature within a module.
					The module extends the base Module class, sets up configurations, and registers events.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Example;

use Proto\\Module\\Module;

/**
 * ExampleModule
 *
 * This module is an example of how to create a module in the Proto framework.
 */
class ExampleModule extends Module
{
    public function activate(): void
    {
        $this->setConfigs();
    }

    private function setConfigs(): void
    {
        setEnv('settingName', 'value');
    }

    protected function addEvents(): void
    {
        // Add an event for when a ticket is added.
        $this->event('Ticket:add', fn($ticket): void => var_dump($ticket));
    }
}`
				)
			]),

			// Registering Gates
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Registering Gates'),
				P({ class: 'text-muted-foreground' },
					`Modules can register gates to control access to their functionality globally using the auth() helper. Gates are defined in the module's
					authorization layer and can be used to restrict access to certain actions or resources.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User;

use Modules\\User\\Auth\\Gates\\UserGate;
use Proto\\Module\\Module;

/**
 * UserModule
 *
 * This module handles user-related functionality.
 *
 * @package Modules\\User
 */
class UserModule extends Module
{
	/**
	 * This will activate the module.
	 *
	 * @return void
	 */
	public function activate(): void
	{
		$this->setAutGates();
	}

	/**
	 * This will set the authentication gates.
	 *
	 * @return void
	 */
	private function setAutGates(): void
	{
		$auth = auth();
		$auth->user = new UserGate();
	}
}`
				)
			]),

			// Module Registration
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Module Registration'),
				P({ class: 'text-muted-foreground' },
					`For a module to be valid and loaded, it must be registered in your configuration file
					(e.g. in the common .env file) under the "modules" key. For example:`
				),
				CodeBlock(
`"modules": [
    "Example\\ExampleModule",
    "Product\\ProductModule",
    "User\\UserModule"
]`
				)
			]),

			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Accessing a Module'),
				P({ class: 'text-muted-foreground' },
					`To access a module's functionality, you can use the modules() helper function. Use the modules() global function and call the module name in camelCase.
					For example:`
				),
				CodeBlock(
`
// In another module anywhere. Usually in a controller
modules()->example()->add();

// To use versioned methods:
modules()->example()->v1()->add();
modules()->example()->v2()->add();

// Access nested feature gateways:
modules()->community()->group()->addMember($userId, $groupId);
modules()->community()->events()->create($data);

// Nested features with versioning:
modules()->community()->group()->v1()->createGroup($data);
`
				),
				P({ class: 'text-muted-foreground' },
					`This is an example controller for the Auth module that calls the User module.`
				),
				CodeBlock(
`
class AuthController
{
	/**
	 * Create a new user.
	 *
	 * @return object
	 */
    public function create(): object
    {
		// Call the user module to add a new user.
        return modules()->user()->add();
    }
}
`
				)
			]),

			// Feature Namespacing
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Feature Namespacing'),
				P({ class: 'text-muted-foreground' },
					`Nested features follow PSR-4 autoloading with the full path namespace. This keeps code organized
					and allows each feature to be self-contained with its own Controllers, Models, and Services.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
// modules/Community/Group/Models/Group.php
namespace Modules\\Community\\Group\\Models;

use Proto\\Models\\Model;

class Group extends Model
{
    protected static ?string $tableName = 'community_groups';
    protected static ?string $alias = 'cg';
    // ...
}

// modules/Community/Group/Controllers/GroupController.php
namespace Modules\\Community\\Group\\Controllers;

use Proto\\Controllers\\ResourceController;
use Modules\\Community\\Group\\Models\\Group;

class GroupController extends ResourceController
{
    public function __construct(protected ?string $model = Group::class)
    {
        parent::__construct();
    }
}`
				)
			]),

			// Migrations in Nested Features
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Migrations in Nested Features'),
				P({ class: 'text-muted-foreground' },
					`Migrations are discovered recursively throughout the module structure (up to 6 levels deep).
					Keep migrations in the feature that owns the tables for better organization.`
				),
				CodeBlock(
`# Migration directories are automatically scanned:
modules/Community/Migrations/
modules/Community/Group/Migrations/
modules/Community/Group/Forum/Migrations/
modules/Community/Events/Migrations/`
				)
			]),

			// Best Practices
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Best Practices'),
				P({ class: 'text-muted-foreground' },
					`Follow these guidelines when working with modules:`
				),
				CodeBlock(
`1. Use nested features when a module has 3+ distinct sub-domains
2. Use Main/ folder when the module needs root-level code alongside features
3. Keep features self-contained - each should have its own Controllers, Models, Services
4. Share cross-feature functionality through parent gateway methods
5. Keep migrations in the feature that owns the tables
6. Organize tests alongside feature code in Feature/Tests/
7. Existing flat modules continue to work - migration can be gradual`
				)
			]),
		]
	);

export default ModulesPage;