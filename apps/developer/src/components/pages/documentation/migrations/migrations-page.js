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
 * MigrationsPage
 *
 * This page documents Proto's migration system. Migrations are classes that update
 * or revert database changes so that all changes can be tracked in Git. They allow you
 * to create new tables, modify columns, add indices, create views, and more.
 *
 * @returns {DocPage}
 */
export const MigrationsPage = () =>
	DocPage(
		{
			title: 'Migrations',
			description: 'Learn how to create and manage migrations to update or revert database changes in Proto.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Migrations are classes used to update or revert database changes.
					They allow database changes to be tracked in Git and support operations such as
					creating tables, altering columns, renaming or dropping columns, adding indices, creating views, adding foreign keys, and more.`
				)
			]),

			// Naming
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'File Naming Convention'),
				P({ class: 'text-muted-foreground font-semibold' },
					`CRITICAL: Migration files must follow a specific naming pattern. This is NOT the same as Laravel.`
				),
				P({ class: 'text-muted-foreground' },
					`Migration filename format: YYYY-MM-DDTHH.MM.SS.MICROSECONDS_ClassName.php`
				),
				P({ class: 'text-muted-foreground' },
					`The class name must match the portion AFTER the underscore in the filename.`
				),
				CodeBlock(
`# Generate timestamp for migration filename
date +"%Y-%m-%dT%H.%M.%S.%6N"
# Output example: 2026-01-21T04.14.30.800125

# Correct filename example:
# 2026-01-21T04.14.30.800125_Event.php → class Event

# WRONG (Laravel style):
# CreateEventsTable.php → Will not be recognized
# 2024_01_21_000000_create_events_table.php → Wrong format`
				),
				CodeBlock(
`<?php declare(strict_types=1);
// File: 2026-01-21T04.14.30.800125_Event.php
use Proto\\Database\\Migrations\\Migration;

// Class name must match portion after underscore
class Event extends Migration
{
    protected string $connection = 'default';

    public function up(): void
    {
        // Code to update the database.
    }

    public function seed(): void
    {
        // Code to seed the database.
    }

    public function down(): void
    {
        // Code to revert the changes.
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`The $connection property should match the database handle name defined in your common/Config .env file.`
				)
			]),

			// Schema Builder
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Schema Builder'),
				P({ class: 'text-muted-foreground' },
					`Proto includes a schema query builder to simplify common database tasks.
					This fluent interface allows you to chain methods for creating and altering tables.
					Available methods include:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("engine()"),
					Li("myisam()"),
					Li("create()"),
					Li("id()"),
					Li("createdAt()"),
					Li("updatedAt()"),
					Li("deletedAt()"),
					Li("removeField()"),
					Li("index()"),
					Li("foreign()")
				]),
				P({ class: 'text-muted-foreground' },
					`For example, in a migration method you might write:`
				),
				CodeBlock(
`$this->create('test_table', function($table) {
    $table->id();
    $table->createdAt();
    $table->updatedAt();
    $table->int('message_id', 20);
    $table->varchar('subject', 160);
    $table->text('message')->nullable();
    $table->datetime('read_at');
    $table->datetime('forwarded_at');

    // Indices
    $table->index('email_read')->fields('id', 'read_at');
    $table->index('created')->fields('created_at');

    // Foreign keys
    // $table->foreign('message_id')->references('id')->on('messages');
});`
				)
			]),

			// Field Types
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Field Types'),
				P({ class: 'text-muted-foreground' },
					`The following field types are available in the schema builder:`
				),
				H4({ class: 'text-md font-semibold mt-4' }, 'Primary Keys & IDs'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("id(length = 30) - INT primary key with auto increment"),
					Li("uuid(length = 36) - VARCHAR UUID field with unique index")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'Integer Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("tinyInteger(length = 1) - TINYINT (1 byte, -128 to 127)"),
					Li("boolean() - Alias for tinyInteger, use for true/false"),
					Li("smallInteger(length) - SMALLINT (2 bytes)"),
					Li("mediumInteger(length) - MEDIUMINT (3 bytes)"),
					Li("integer(length) or int(length) - INT (4 bytes)"),
					Li("bigInteger(length) - BIGINT (8 bytes)")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'Decimal & Float Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("decimal(precision, scale) - DECIMAL (exact precision for currency)"),
					Li("floatType(length) - FLOAT (approximate, 4 bytes)"),
					Li("doubleType(length) - DOUBLE (approximate, 8 bytes)")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'String Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("char(length) - CHAR (fixed-length string)"),
					Li("varchar(length) - VARCHAR (variable-length, max 65535)")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'Text Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("tinyText() - TINYTEXT (max 255 chars)"),
					Li("text() - TEXT (max 65,535 chars)"),
					Li("mediumText() - MEDIUMTEXT (max 16MB)"),
					Li("longText() - LONGTEXT (max 4GB)")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'Binary Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("binary(length) - BINARY (fixed-length binary)"),
					Li("bit() - BIT (default length 1)"),
					Li("tinyBlob() - TINYBLOB (max 255 bytes)"),
					Li("blob(length) - BLOB (max 65KB)"),
					Li("mediumBlob(length) - MEDIUMBLOB (max 16MB)"),
					Li("longBlob(length) - LONGBLOB (max 4GB)")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'Date & Time Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("date() - DATE (YYYY-MM-DD)"),
					Li("datetime() - DATETIME (YYYY-MM-DD HH:MM:SS)"),
					Li("timestamp() - TIMESTAMP (auto-updates on change)")
				]),
				H4({ class: 'text-md font-semibold mt-4' }, 'Special Types'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("enum('field', 'val1', 'val2', 'val3') - ENUM (predefined values)"),
					Li("json() - JSON (native JSON column type)"),
					Li("point() - POINT (spatial data for geo coordinates)")
				])
			]),

			// Field Modifiers
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Field Modifiers'),
				P({ class: 'text-muted-foreground' },
					`Chain these modifiers after field type declarations:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("->nullable() - Allow NULL values"),
					Li("->default(value) - Set default value"),
					Li("->currentTimestamp() - Default to CURRENT_TIMESTAMP"),
					Li("->utcTimestamp() - Default to UTC_TIMESTAMP"),
					Li("->primary() - Set as primary key"),
					Li("->autoIncrement() - Enable auto increment"),
					Li("->after('field') - Position after specified field"),
					Li("->rename('newName') - Rename field")
				]),
				CodeBlock(
`$this->create('events', function($table) {
    $table->id();
    $table->uuid();
    $table->varchar('name', 200);
    $table->text('description')->nullable();
    $table->enum('status', 'draft', 'published', 'archived')->default("'draft'");
    $table->date('event_date');
    $table->point('location');  // For geo coordinates
    $table->json('metadata');   // For JSON data
    $table->decimal('price', 10, 2)->nullable();
    $table->boolean('is_featured')->default(0);
    $table->timestamps();       // created_at and updated_at
    $table->deletedAt();        // For soft deletes

    // Indexes
    $table->index('event_date_idx')->fields('event_date');
    $table->unique('name_unique')->fields('name');

    // Foreign keys
    $table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
});`
				)
			]),

			// Up Method
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Up Method'),
				P({ class: 'text-muted-foreground' },
					`The up() method should include all the commands to update the database.
					For example:`
				),
				CodeBlock(
`public function up(): void
{
    // Create a table.
    $this->create('test_table', function($table) {
        $table->id();
        $table->createdAt();
        $table->updatedAt();
        $table->int('message_id', 20);
        $table->varchar('subject', 160);
        $table->text('message')->nullable();
        $table->datetime('read_at');
        $table->datetime('forwarded_at');
        $table->index('email_read')->fields('id', 'read_at');
        $table->index('created')->fields('created_at');
    });

    // Create or replace a view using the query builder.
    $this->createView('vw_test')
         ->table('test_table', 't')
         ->select('id', 'created_at')
         ->where('id > 1');

    // Create or replace a view using an SQL string.
    $this->createView('vw_test_query')
         ->query('SELECT * FROM test_table');

    // Alter the table.
    $this->alter('test_table', function($table) {
        $table->add('status')->int(20);
        $table->alter('subject')->varchar(180);
        $table->drop('read_at');
    });
}`
				)
			]),

			// Down Method
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Down Method'),
				P({ class: 'text-muted-foreground' },
					`The down() method should revert all changes made in the up() method.
					For example:`
				),
				CodeBlock(
`public function down(): void
{
    // Revert changes to the table.
    $this->alter('test_table', function($table) {
        $table->drop('status');
        $table->alter('subject')->varchar(160);
        $table->add('read_at')->datetime();
    });

    // Drop a view.
    $this->dropView('vw_test');

    // Drop the table.
    $this->drop('test_table');
}`
				)
			]),

			// Seeding Data
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Seeding Data'),
				P({ class: 'text-muted-foreground' },
					`You can also seed data in the up() method. For example:`
				),
				CodeBlock(
`/**
 * Seed the database with roles and permissions.
 *
 * @return void
 */
public function seed(): void
{
	// Define basic roles
	$roles = [
		[
			'name' => 'Administrator',
			'slug' => 'admin',
			'description' => 'Full system access'
		]
	];

	// Insert roles
	foreach ($roles as $role)
	{
		$this->insert('roles', $role);
	}

	// Define basic permissions
	$permissions = [
		// User management permissions
		[
			'name' => 'View Users',
			'slug' => 'users.view',
			'description' => 'Can view users',
			'module' => 'user',
		]
	];

	// Insert permissions
	foreach ($permissions as $permission)
	{
		$this->insert('permissions', $permission);
	}

	// Get the role IDs
	$managerRoleId = $this->first('SELECT id FROM roles WHERE slug = ?', ['manager'])->id;
	$editorRoleId = $this->first('SELECT id FROM roles WHERE slug = ?', ['editor'])->id;

	// Assign all permissions to the manager role
	$allPermissions = $this->fetch('SELECT id FROM permissions');
	foreach ($allPermissions as $permission)
	{
		$this->insert('role_permissions', [
			'role_id' => $managerRoleId,
			'permission_id' => $permission->id,
		]);
	}

	// Assign only view and edit permissions to the editor role
	$editorPermissions = $this->fetch('SELECT id FROM permissions WHERE slug LIKE "%.view" OR slug LIKE "%.edit"');
	foreach ($editorPermissions as $permission)
	{
		$this->insert('role_permissions', [
			'role_id' => $editorRoleId,
			'permission_id' => $permission->id,
		]);
	}
}`
				)
			]),

			// Creating a Migration
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Creating a Migration'),
				P({ class: 'text-muted-foreground' },
					`Migrations can be generated using the built-in generator. For example:`
				),
				CodeBlock(
`$generator = new Proto\\Generators\\Generator();
$generator->createMigration((object)[
    'className' => 'Example'
]);`
				)
			]),

			// Migration Guide
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Migration Guide'),
				P({ class: 'text-muted-foreground' },
					`The migration guide can run or revert migrations. For example:`
				),
				CodeBlock(
`use Proto\\Database\\Migrations\\Guide;

$handler = new Guide();
// Run migrations.
$handler->run();

// Revert migrations.
$handler->revert();`
				)
			])
		]
	);

export default MigrationsPage;