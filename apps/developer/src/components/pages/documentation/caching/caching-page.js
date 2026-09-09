import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
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
 * CachingPage
 *
 * This page documents Proto's built-in cache layer.
 *
 * @returns {DocPage}
 */
export const CachingPage = () =>
	DocPage(
		{
			title: 'Caching',
			description: 'Configure Proto\'s cache driver, cache controller responses safely, and invalidate them when data changes.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Proto ships with a cache layer built around a pluggable driver. Redis is the
					supported driver. Caching is opt-in at every level: no driver is configured by
					default, and no controller is cached until it says so.`
				),
				P({ class: 'text-muted-foreground' },
					`Every cache call degrades to "no cache" when a driver is unavailable. A cache
					backend being unreachable slows the application down, but it never takes it down,
					so you do not need to guard your own calls.`
				)
			]),

			// Configuration
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Configuration'),
				P({ class: 'text-muted-foreground' },
					`Caching is configured under the "cache" key in common/Config/.env. Leave "driver"
					null to disable caching entirely.`
				),
				CodeBlock(
`{
    "cache": {
        "driver": "RedisDriver",
        "connection": {
            "host": "redis",
            "port": 6379,
            "password": "your_redis_password"
        }
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`After changing this file, regenerate the Docker environment so the containers
					pick the values up.`
				),
				CodeBlock(`./infrastructure/scripts/run.sh sync-config`)
			]),

			// Cache facade
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'The Cache Facade'),
				P({ class: 'text-muted-foreground' },
					`Proto\\Cache\\Cache is a static facade over the active driver. Values are stored
					as strings, so encode structured data before writing it and decode it on read.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Cache\\Cache;

// Read-through pattern
$key = 'report:monthly:' . $userId;
$cached = Cache::get($key);
if ($cached !== null)
{
    return json_decode($cached, true);
}

$report = $this->buildExpensiveReport($userId);

// Third argument is the TTL in seconds
Cache::set($key, json_encode($report), 3600);

return $report;`
				),
				P({ class: 'text-muted-foreground' },
					`Available methods:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('Cache::get(string $key): ?string - returns null on a miss or when no driver is active'),
					Li('Cache::set(string $key, string $value, ?int $expire = null): void'),
					Li('Cache::has(string $key): bool'),
					Li('Cache::delete(string $key): bool'),
					Li('Cache::incr(string $key): int - atomic counter, useful for rate limits'),
					Li('Cache::expire(string $key, int $seconds): bool and Cache::ttl(string $key): int'),
					Li('Cache::keys(string $pattern): ?array - pattern lookup, use sparingly'),
					Li('Cache::isSupported(): bool - whether a driver is configured and reachable')
				])
			]),

			// Controller response caching
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Caching Controller Responses'),
				P({ class: 'text-muted-foreground' },
					`A controller opts in by setting $cacheable. The router then wraps it in a cache
					proxy that serves reads from cache and clears them on writes.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Product\\Controllers;

use Proto\\Controllers\\ResourceController;
use Modules\\Product\\Models\\Product;

class ProductController extends ResourceController
{
    protected bool $cacheable = true;

    protected ?string $policy = ProductPolicy::class;

    public function __construct()
    {
        parent::__construct(Product::class);
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`The proxy is skipped, and the controller runs normally, when any of the following
					is true. This is why cached responses do not appear during local development.`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('The controller does not declare $cacheable'),
					Li('No cache driver is configured or reachable'),
					Li("The environment is 'dev'")
				])
			]),

			// Scoped keys
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Responses Are Cached Per User'),
				P({ class: 'text-muted-foreground' },
					`Cached responses are never shared between viewers. Every key includes a scope
					token identifying the acting user, or the anonymous session when signed out.`
				),
				CodeBlock(
`Modules\\Product\\Controllers\\ProductController:u42:all:{"limit":20}
Modules\\Product\\Controllers\\ProductController:u7:get:15
Modules\\Product\\Controllers\\ProductController:sA1B2C3:all:{"limit":20}
             ^controller                        ^scope ^method ^params`
				),
				P({ class: 'text-muted-foreground' },
					`This is deliberate. Two users may be permitted to see different rows, or different
					fields on the same row, so a globally shared payload would leak data across
					accounts. The tradeoff is a lower hit rate, which is the correct default for a
					response cache that sits behind authorization.`
				)
			]),

			// Invalidation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Invalidation'),
				P({ class: 'text-muted-foreground' },
					`Because a write by one user can change what every other user would see, writes
					invalidate across all scopes using a wildcard pattern rather than only the acting
					user's keys.`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('add, setup and merge clear the cached list responses'),
					Li('update and updateStatus clear get:{id} for every scope, then the list responses'),
					Li('delete clears that row and the list responses'),
					Li('GET requests are cached; every other method is treated as a write')
				]),
				P({ class: 'text-muted-foreground' },
					`Writes performed outside the controller, such as a direct Model::update() in a job
					or a seeder, do not pass through the proxy and will not invalidate anything. Clear
					those keys yourself, or let them expire.`
				)
			]),

			// Best practices
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Best Practices'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('Enable $cacheable on read-heavy endpoints such as catalogs and taxonomies'),
					Li('Do not enable it on endpoints that return one-off or rapidly changing data'),
					Li('Always set a TTL on manual Cache::set() calls so a missed invalidation self-heals'),
					Li('Encode structured values with json_encode; the driver stores strings'),
					Li('Use Cache::incr() for counters instead of a read-modify-write sequence'),
					Li('Avoid Cache::keys() on hot paths, since pattern scans are expensive on large keyspaces'),
					Li('Never cache a value that has not already passed the same authorization checks as an uncached response')
				])
			])
		]
	);

export default CachingPage;
