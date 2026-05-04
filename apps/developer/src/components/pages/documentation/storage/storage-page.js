import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { DocPage } from "../../types/doc/doc-page.js";

/**
 * CodeBlock
 *
 * Adds copy-to-clipboard and visual formatting.
 */
const CodeBlock = Atom((props, children) =>
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
);

export const StoragePage = () =>
	DocPage(
		{
			title: 'Storage',
			description: 'Learn how to use Proto\'s storage system to interact with your database via query builders and adapters.'
		},
		[

			// OVERVIEW
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Storage is an object used to get and set data to the database table. It can access its parent model and inherits all built-in CRUD methods from the base class. You don't need to manually write basic methods in most child storage classes.`
				)
			]),

			// NAMING
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Naming'),
				P({ class: 'text-muted-foreground' },
					`Storage classes should be singular and end with "Storage".`
				),
				H4({ class: 'font-semibold' }, 'Example: Naming a Storage Class'),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Common\\Storage;
use Proto\\Storage\\Storage;

class ExampleStorage extends Storage
{
	// inherits CRUD methods
}`
				)
			]),

			// CONNECTION PROPERTY
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Connection Property'),
				P({ class: 'text-muted-foreground' },
					`Define a custom database connection if this storage should use a different DB from the default.`
				),
				H4({ class: 'font-semibold' }, 'Set a Custom Connection'),
				CodeBlock(`protected string $connection = 'default';`)
			]),

			// DATABASE ADAPTER
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Database Adapter'),
				P({ class: 'text-muted-foreground' },
					`The storage layer uses a database adapter (usually Mysqli) for executing SQL operations.`
				),
				H4({ class: 'font-semibold' }, 'Adapter Methods'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li("select(), insert(), update(), delete()"),
					Li("execute(), query(), fetch()"),
					Li("beginTransaction(), commit(), rollback(), transaction()")
				]),
				H4({ class: 'font-semibold' }, 'Example: Fetch Rows Using Adapter'),
				CodeBlock(`$rows = $this->db->fetch('SELECT * FROM example');`)
			]),

			// QUERY BUILDER
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Query Builder'),
				P({ class: 'text-muted-foreground' },
					`Storage gives access to a fluent query builder to compose SQL easily.`
				),
				H4({ class: 'font-semibold' }, 'Available Builder Methods'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li("select(), insert(), update(), delete()"),
					Li("join(), leftJoin(), rightJoin(), outerJoin()"),
					Li("where(), in(), orderBy(), groupBy(), having(), distinct(), limit()"),
					Li("union() - Combine queries")
				]),
				H4({ class: 'font-semibold' }, 'Execution Methods'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li("fetch($params) - Execute and return all rows"),
					Li("first($params) - Execute and return first row"),
					Li("execute($params) - Execute statement (returns bool)")
				]),
				H4({ class: 'font-semibold' }, 'Example: Simple Select Query'),
				CodeBlock(
`$sql = $this->table()
	->select()
	->where("status = 'active'");

$rows = $sql->fetch();  // Direct execution on builder
// OR
$rows = $this->fetch($sql); // Pass to storage method`
				),
				H4({ class: 'font-semibold' }, 'Example: Chained Conditions'),
				P({ class: 'text-muted-foreground' },
					`Chain multiple conditions in a single where() call rather than multiple calls:`
				),
				CodeBlock(
`// ✅ CORRECT - Single where() with multiple conditions
$sql = $this->table()
	->select()
	->where('status = ?', 'deleted_at IS NULL', 'type = ?')
	->orderBy('created_at DESC')
	->limit($limit);

$rows = $sql->fetch(['active', 'premium']);

// ❌ AVOID - Multiple where() calls (less efficient)
$sql = $this->table()
	->select()
	->where('status = ?')
	->where('deleted_at IS NULL')
	->where('type = ?');`
				),
				H4({ class: 'font-semibold' }, 'Important: limit() Argument Order'),
				P({ class: 'text-muted-foreground' },
					`Proto's limit(a, b) generates LIMIT a, b. MySQL interprets this as "skip a rows, take b rows".
					Always pass offset first, count second:`
				),
				CodeBlock(
`// ✅ CORRECT - offset first, count second
->limit(0, 20)             // LIMIT 0, 20 → returns 20 rows
->limit($offset, $limit)   // correct order

// ❌ WRONG - reversed: returns 0 rows
->limit(20, 0)             // LIMIT 20, 0 → skips 20 rows, takes 0`
				),
				H4({ class: 'font-semibold' }, 'Important: select() Raw Expressions'),
				P({ class: 'text-muted-foreground' },
					`Proto's select() with a plain string prepends the table alias, producing invalid SQL.
					Use array format for raw expressions:`
				),
				CodeBlock(
`// ✅ CORRECT - array format bypasses alias prefix
->select([['COUNT(*)'], 'total'])       // SELECT COUNT(*) AS total

// ❌ WRONG - plain string gets alias prepended
->select('COUNT(*) as total')           // SELECT un.COUNT(*) as total`
				),
				H4({ class: 'font-semibold' }, 'Union Building Updates'),
				P({ class: 'text-muted-foreground' },
					`Two improvements were added for union query building: Select::render() now places ORDER BY and LIMIT after all UNION clauses, and UnionQuery provides a cleaner builder for multi-segment UNION ALL queries.`
				),
				H4({ class: 'font-semibold' }, 'Select::render() Union Fix'),
				P({ class: 'text-muted-foreground' },
					`When unions exist, ORDER BY and LIMIT are now rendered after all UNION clauses so they apply to the complete result set instead of only the first SELECT.`
				),
				CodeBlock(
`// ✅ Correct semantic ordering
SELECT ...
UNION ALL SELECT ...
ORDER BY sortDate DESC
LIMIT 0, 20`
				),
				H4({ class: 'font-semibold' }, 'New UnionQuery Builder'),
				P({ class: 'text-muted-foreground' },
					`Use UnionQuery when combining multiple select segments. It handles parameter merging, applies ORDER BY and LIMIT at the union level, and returns the standard {rows, lastCursor} envelope.`
				),
				CodeBlock(
`use Proto\\Storage\\UnionQuery;

$result = UnionQuery::make($this->db)
	->segment($logsSql, $logsParams)
	->segment($planSql, $planParams)
	->orderBy('sortDate DESC')
	->limit($offset, $limit)
	->fetch();

return $result; // { rows, lastCursor }`
				),
				H4({ class: 'font-semibold' }, 'Why Use UnionQuery'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li('No manual array_merge() for params across segments'),
					Li('No ambiguity about where orderBy() and limit() should be applied'),
					Li('Returns {rows, lastCursor} consistently from a single fetch() call'),
					Li('Keeps SQL semantics correct for UNION ALL ordering and pagination')
				]),
				P({ class: 'text-muted-foreground' },
					`UNION ALL still requires symmetric field lists with identical column count and order. For readability, extract shared field definitions into helper methods such as serviceLogFields() and planItemFields().`
				),
				H4({ class: 'font-semibold' }, 'Query Builder Joins'),
				P({ class: 'text-muted-foreground' },
					`join() accepts only a callable or an array. Passing a raw SQL string will throw a fatal error.`
				),
				CodeBlock(
`// Form 1 — Closure with JoinBuilder (preferred)
->join(function($joins)
{
	$joins->left('users', 'u')
		->on('u.id = cp.user_id')
		->fields('first_name', 'last_name', 'email');

	$joins->join('other_table', 'ot')
		->on('ot.id = u.org_id', 'ot.deleted_at IS NULL');
})

// Form 2 — Array (simple single joins)
->leftJoin([
	'table' => 'users',
	'alias' => 'u',
	'on' => ['cp.user_id = u.id', 'u.deleted_at IS NULL']
])`
				),
				P({ class: 'text-muted-foreground font-semibold' },
					`Note: When joined tables share column names (e.g., status, created_at, id), always prefix
					every reference with the table alias in where(), orderBy(), select(), and on().`
				)
			]),

			// DEBUGGING
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Debugging Queries'),
				P({ class: 'text-muted-foreground' },
					`Use casting or debug() to inspect the generated SQL.`
				),
				H4({ class: 'font-semibold' }, 'Example: Debugging'),
				CodeBlock(
`echo $sql;
$sql->debug();`
				)
			]),

			// HELPER METHODS
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Helper Methods'),
				P({ class: 'text-muted-foreground' },
					`Common shortcuts available on all storage classes.`
				),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li("table() - model's query builder"),
					Li("builder(table, alias) - custom table builder"),
					Li("select() - selects default columns"),
					Li("where() - creates filtered queries")
				]),
				H4({ class: 'font-semibold' }, 'Example: Table vs. Builder'),
				CodeBlock(
`$sql = $this->table()->select()->where("name = 'John'");
$sql = $this->builder('other_table', 'o')->select()->where("o.active = 1");`
				)
			]),

			// FILTER ARRAYS
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Filter Arrays'),
				P({ class: 'text-muted-foreground' },
					`Filters simplify conditions and are used in methods like getBy(), where(), all().`
				),
				H4({ class: 'font-semibold' }, 'Supported Filter Formats'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li(`Raw SQL: "a.id = '1'"`),
					Li(`Manual bind: ["created_at BETWEEN ? AND ?", [date1, date2]]`),
					Li(`Auto-bind: ["a.id", $user->id]`),
					Li(`Operator: ["a.id", ">", $user->id]`),
					Li(`IN array: ["userId", "IN", [1, 2, 3]] — auto-generates placeholders`),
					Li(`NOT IN array: ["status", "NOT IN", ["banned", "deleted"]]`)
				]),
				H4({ class: 'font-semibold' }, 'Example: Applying Filters'),
				CodeBlock(
`$filter = [
	"a.id = '1'",
	["a.created_at BETWEEN ? AND ?", ['2021-02-02', '2021-02-28']],
	['a.id', $user->id],
	['a.id', '>', $user->id]
];

$row = $this->getBy($filter);   // one
$rows = $this->fetchWhere($filter);   // many`
				),
				H4({ class: 'font-semibold' }, 'IN / NOT IN with Arrays'),
				P({ class: 'text-muted-foreground' },
					`The IN shorthand auto-generates placeholders from an array of values. Works with table aliases and can be combined with other filter formats.`
				),
				CodeBlock(
`// IN / NOT IN (auto-generates placeholders)
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

			// FILTER HELPER METHODS
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Filter Helper Methods (Proto\\Storage\\Filter)'),
				P({ class: 'text-muted-foreground' },
					`Proto provides static helper methods on the Filter class to eliminate raw SQL strings from filter arrays. These generate parameterized, sanitized filter entries. In development mode, Proto logs a deprecation warning when raw SQL strings are used as filter values.`
				),
				H4({ class: 'font-semibold' }, 'Available Methods'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li('Filter::exists($table, $alias, $joinCondition, $conditions) — returns [sql, [params]] EXISTS subquery'),
					Li('Filter::notExists($table, $alias, $joinCondition, $conditions) — returns [sql, [params]] NOT EXISTS subquery'),
					Li('Filter::aliased($alias, $column, $value, $operator) — returns sanitized filter entry, auto snake_case'),
					Li('Filter::condition($alias, $column, $expression) — returns whitelisted static SQL string')
				]),
				H4({ class: 'font-semibold mt-4' }, 'EXISTS / NOT EXISTS'),
				P({ class: 'text-muted-foreground' },
					`Replaces raw EXISTS (SELECT 1 FROM ...) strings with parameterized subqueries. Returns [sql, [params]] that can be added directly to any filter array.`
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

// NOT EXISTS — same API, generates NOT EXISTS
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
					`Returns a safe static SQL string. Only whitelisted expressions are allowed: IS NULL, IS NOT NULL, > NOW(), >= NOW(), < NOW(), <= NOW(), = NOW(). Unrecognized expressions return '1=1' and trigger a warning.`
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

			// FIND & FINDALL
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Find and FindAll'),
				P({ class: 'text-muted-foreground' },
					`Find allows dynamic queries without creating a custom storage method.`
				),
				H4({ class: 'font-semibold' }, 'Examples: Find/FindAll'),
				CodeBlock(
`$this->findAll(function($sql, &$params) {
	$params[] = 'active';
	$sql->where('status = ?')->orderBy('status DESC')->groupBy('user_id');
});

$this->find(function($sql, &$params) {
	$params[] = 'active';
	$sql->where('status = ?')->limit(1);
});`
				)
			]),

			// SEARCHBYJOIN
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Search By Join'),
				P({ class: 'text-muted-foreground' },
					`The searchByJoin() method automatically generates EXISTS subqueries for searching within nested join data. This eliminates the need to write complex raw SQL when searching across relationships.`
				),
				H4({ class: 'font-semibold' }, 'Method Signature'),
				CodeBlock(
`searchByJoin(
	string $joinAlias,
	array $searchFields,
	string $searchValue,
	array &$params
): string`
				),
				P({ class: 'text-muted-foreground' },
					`Returns an EXISTS subquery SQL string and appends bound parameters to the $params array.`
				),
				H4({ class: 'font-semibold' }, 'Parameters'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li("joinAlias - The alias of the join relationship defined in your model"),
					Li("searchFields - Array of field names to search (in camelCase)"),
					Li("searchValue - The value to search for (wrapped with % wildcards automatically)"),
					Li("params - Reference to params array (method appends bound values)")
				]),
				H4({ class: 'font-semibold' }, 'Example: Search Nested Join Data'),
				P({ class: 'text-muted-foreground' },
					`Without searchByJoin() you would need to write complex EXISTS subqueries manually:`
				),
				CodeBlock(
`// OLD WAY - Manual EXISTS subquery
protected function setCustomWhere($sql, &$params, $options)
{
	if (!empty($options['search']))
	{
		$search = '%' . $options['search'] . '%';
		$sql->where("EXISTS (
			SELECT 1 FROM conversation_participants cpp
			INNER JOIN users u ON cpp.user_id = u.id
			WHERE cpp.conversation_id = cp.conversation_id
			AND cpp.deleted_at IS NULL
			AND (u.first_name LIKE ? OR u.last_name LIKE ?)
		)");
		$params[] = $search;
		$params[] = $search;
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`With searchByJoin() the same query becomes a single line:`
				),
				CodeBlock(
`// NEW WAY - Automatic subquery generation
protected function setCustomWhere($sql, &$params, $options)
{
	if (!empty($options['search']))
	{
		$sql->where(
			$this->searchByJoin('participants', ['firstName', 'lastName'], $options['search'], $params)
		);
	}
}`
				),
				H4({ class: 'font-semibold' }, 'How It Works'),
				Ul({ class: 'list-disc pl-6 text-muted-foreground' }, [
					Li("Automatically walks your model's join tree to find the target join by alias"),
					Li("Builds the complete chain of joins from parent to target relationship"),
					Li("Generates proper EXISTS subquery with INNER JOINs and table aliases"),
					Li("Converts camelCase field names to snake_case for database columns"),
					Li("Handles NULL checks on intermediate join tables (deleted_at, etc.)"),
					Li("Binds parameters safely with LIKE wildcards for fuzzy matching")
				]),
				H4({ class: 'font-semibold' }, 'Multiple Field Search'),
				P({ class: 'text-muted-foreground' },
					`Search across multiple fields with OR conditions:`
				),
				CodeBlock(
`// Searches firstName OR lastName OR email
$sql->where(
	$this->searchByJoin(
		'participants',
		['firstName', 'lastName', 'email'],
		$searchTerm,
		$params
	)
);`
				),
				H4({ class: 'font-semibold' }, 'Nested Join Support'),
				P({ class: 'text-muted-foreground' },
					`Works with deeply nested relationships defined in your model:`
				),
				CodeBlock(
`// In your Model class:
protected function setJoins(): array
{
	return [
		$this->many('participants', 'conversation_id', ConversationParticipant::class, 'conversationId', function($join) {
			return [
				$join->one('user', 'userId', User::class, 'id')
			];
		})
	];
}

// In your Storage class:
// Searches in the nested user relationship
$sql->where(
	$this->searchByJoin('participants', ['firstName', 'lastName'], $search, $params)
);`
				)
			]),

			// EXAMPLES
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Example Queries'),

				H4({ class: 'font-semibold' }, 'Custom Select with Conditions'),
				CodeBlock(
`public function checkRequest(string $requestId, int $userId): bool
{
	$sql = $this->table()
		->select('id')
		->where(
			["user_id", "?"], // Equality comparison with param bind placeholder
			"request_id = ?", // raw sql with placeholder
			"status = 'pending'", //raw sql
			["created_at", "<=", "DATE_ADD(created_at, INTERVAL 1 DAY)"] // Custom comparison operator
		)
		->limit(1);

		$rows = $this->fetch($sql, [$userId, $requestId]);
	return (count($rows) > 0);
}`
				),

				H4({ class: 'font-semibold' }, 'Custom Update Query'),
				CodeBlock(
`public function updateStatusByRequest(string $requestId, string $status = 'complete'): bool
{
	$sql = $this->table()
		->update("status = ?")
		->where("request_id = ?");

	return $this->execute($sql, [$status, $requestId]);
}`
				),

				H4({ class: 'font-semibold' }, 'Custom Update with Join'),
				CodeBlock(
`public function updateAccessedAt(string $userId, string $guid, string $ipAddress): bool
{
	$dateTime = date('Y-m-d H:i:s');
	$sql = $this->table()
		->update("{$this->alias}.accessed_at = '{$dateTime}'")
		->join(function($joins) {
			$joins
				->left('user_authed_devices', 'ud')
				->on("{$this->alias}.device_id = ud.id");
		})
		->where("{$this->alias}.ip_address = ?", "ud.user_id = ?", "ud.guid = ?");

	return $this->execute($sql, [$ipAddress, $userId, $guid]);
}`
				),

				H4({ class: 'font-semibold' }, 'Select with UnionQuery'),
				CodeBlock(
`use Proto\\Storage\\UnionQuery;

protected function getTimeline(int $vehicleId, int $offset = 0, int $limit = 20): object
{
	$logsSql = $this->builder('vehicle_service_logs', 'vsl')
		->select(['vsl.id', 'id'], ['vsl.service_date', 'sortDate'], ['vsl.notes', 'details'])
		->where('vsl.vehicle_id = ?', 'vsl.deleted_at IS NULL');

	$planSql = $this->builder('vehicle_service_plan_items', 'vspi')
		->select(['vspi.id', 'id'], ['vspi.scheduled_date', 'sortDate'], ['vspi.description', 'details'])
		->where('vspi.vehicle_id = ?', 'vspi.deleted_at IS NULL');

	return UnionQuery::make($this->db)
		->segment($logsSql, [$vehicleId])
		->segment($planSql, [$vehicleId])
		->orderBy('sortDate DESC')
		->limit($offset, $limit)
		->fetch();
}`
				),
				P({ class: 'text-muted-foreground' },
					`Tip: keep getTimeline() concise by extracting each segment's field list into protected helpers. Symmetric column order must remain identical across all union segments.`
				),

				H4({ class: 'font-semibold' }, 'Legacy Select->union() Example'),
				CodeBlock(
`protected function getByOptionInnerQuery()
{
	return $this->table()
		->select(['id', 'callsId'], ['NULL as calendarId'], ['scheduled', 'callStart'], ['id', 'created'])
		->join(function($joins) {
			$joins
				->left('list_options', 'lo')
				->on("{$this->alias}.type_id = lo.option_number");
		})
		->where(
			"{$this->alias}.client_id = ?",
			"lo.list_id = ?",
			"lo.option_number = ?",
			"{$this->alias}.status IN (?)"
		)
		->union(
			$this->builder('calendar', 'cal')
			->select(['NULL as callsId'], ['id', 'calendarId'], ['start', 'callStart'], ['id', 'created'])
			->where('cal.client_id = ?', 'cal.type = ?', 'cal.deleted = 0')
		);
}`
				),

				H4({ class: 'font-semibold' }, 'Delete with Conditions'),
				CodeBlock(
`public function deleteRole(int $userId, int $roleId): bool
{
	$sql = $this->table()
		->delete()
		->where('user_id = ?', 'role_id = ?');

	return $this->db->execute($sql, [$userId, $roleId]);
}`
				)
			])
		]
	);

export default StoragePage;
