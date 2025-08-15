import { Code, H4, P, Pre, Section } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../doc-page.js";

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
 * DatabasePage
 *
 * This page documents Proto's database system including connections,
 * query builder, ORM features, and database management.
 *
 * @returns {DocPage}
 */
export const DatabasePage = () =>
	DocPage(
		{
			title: 'Database & Query Builder',
			description: 'Learn how to work with databases, query builders, ORM features, and database management in Proto.'
		},
		[
			// Overview
			Section({ class: 'space-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Proto provides a comprehensive database system with connection management,
					a powerful query builder, ORM features, and support for multiple database
					adapters. The system includes connection caching, query optimization,
					and robust migration support.`
				)
			]),

			// Database Connections
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Database Connections'),
				P({ class: 'text-muted-foreground' },
					`Configure and manage multiple database connections with automatic
					connection pooling and caching.`
				),
				CodeBlock(
`// Configuration in Common/Config/.env
{
    "connections": {
        "default": {
            "host": "localhost",
            "port": 3306,
            "database": "proto",
            "username": "root",
            "password": "password",
        }
    }
}`
				)
			]),

			// Query Builder
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Query Builder'),
				P({ class: 'text-muted-foreground' },
					`Proto's query builder provides a fluent interface for building SQL queries
					with support for complex joins, subqueries, and aggregations.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Database\\QueryBuilder;

// Basic queries
$users = QueryBuilder::table('users')
    ->select('id', 'name', 'email')
    ->where('active', 1)
    ->orderBy('created_at DESC')
    ->limit(10)
    ->fetch();

// Complex where conditions
$posts = QueryBuilder::table('posts')
    ->where('status = "published"')
    ->where('created_at > "2024-01-01"')
    ->fetch();

// Joins
$userPosts = QueryBuilder::table('users')
    ->select()
    ->leftJoin([
        'table' => 'posts',
        'on' => 'users.id = posts.user_id'
    ])
    ->where('users.active = 1')
    ->orderBy('posts.created_at desc')
    ->get();`
				)
			]),

			// Model Integration
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Model Integration'),
				P({ class: 'text-muted-foreground' },
					`Proto models integrate seamlessly with the query builder, providing
					ORM-like functionality with additional features.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Models;

use Proto\\Models\\Model;

class User extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string|null
     */
    protected static ?string $tableName = 'users';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected string $idKeyName = 'id';

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected string $connection = 'default';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected static array $fields = [
        'name', 'email', 'password', 'status'
    ];

    // Relationships
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}

// Usage examples
$user = User::get(1);

$roles = $user->roles;`
				)
			])
		]
	);

export default DatabasePage;
