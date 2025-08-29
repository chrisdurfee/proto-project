import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
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
 * CachingPage
 *
 * This page documents basic caching concepts and patterns for Proto applications.
 *
 * @returns {DocPage}
 */
export const CachingPage = () =>
	DocPage(
		{
			title: 'Caching Concepts',
			description: 'Learn about caching strategies and patterns for improving application performance in Proto.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Caching is an important technique for improving application performance by storing
					frequently accessed data in memory or fast storage systems. This page covers general
					caching concepts and patterns that can be applied in Proto applications.`
				)
			]),

			// Basic Caching Concepts
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Basic Caching Concepts'),
				P({ class: 'text-muted-foreground' },
					`Caching involves storing copies of data in a location where it can be accessed
					more quickly than from the original source.`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("Cache Hit: When requested data is found in cache"),
					Li("Cache Miss: When requested data is not in cache"),
					Li("TTL (Time To Live): How long data stays in cache"),
					Li("Cache Invalidation: Removing or updating cached data"),
					Li("Cache Warming: Pre-loading cache with important data")
				])
			]),

			// Memory Caching
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Simple Memory Caching'),
				P({ class: 'text-muted-foreground' },
					`Simple in-memory caching can be implemented using static arrays or objects
					to store frequently accessed data within a single request.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

/**
 * Simple memory cache implementation
 */
class SimpleCache
{
    private static array $cache = [];

    public static function get(string $key): mixed
    {
        return self::$cache[$key] ?? null;
    }

    public static function put(string $key, mixed $value): void
    {
        self::$cache[$key] = $value;
    }

    public static function forget(string $key): void
    {
        unset(self::$cache[$key]);
    }

    public static function flush(): void
    {
        self::$cache = [];
    }
}

// Usage example
$expensiveData = SimpleCache::get('user_data');
if ($expensiveData === null) {
    $expensiveData = performExpensiveOperation();
    SimpleCache::put('user_data', $expensiveData);
}
`
				)
			]),

			// File-based Caching
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'File-based Caching'),
				P({ class: 'text-muted-foreground' },
					`File-based caching stores data in files on disk, providing persistence
					across requests and application restarts.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

/**
 * File-based cache implementation
 */
class FileCache
{
    private string $cacheDir;

    public function __construct(string $cacheDir = '/tmp/cache')
    {
        $this->cacheDir = $cacheDir;
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    public function get(string $key): mixed
    {
        $filename = $this->getFilename($key);

        if (!file_exists($filename)) {
            return null;
        }

        $data = unserialize(file_get_contents($filename));

        // Check if expired
        if ($data['expires'] > 0 && time() > $data['expires']) {
            $this->forget($key);
            return null;
        }

        return $data['value'];
    }

    public function put(string $key, mixed $value, int $ttl = 0): void
    {
        $filename = $this->getFilename($key);
        $expires = $ttl > 0 ? time() + $ttl : 0;

        $data = [
            'value' => $value,
            'expires' => $expires,
            'created' => time()
        ];

        file_put_contents($filename, serialize($data));
    }

    public function forget(string $key): void
    {
        $filename = $this->getFilename($key);
        if (file_exists($filename)) {
            unlink($filename);
        }
    }

    private function getFilename(string $key): string
    {
        return $this->cacheDir . '/' . md5($key) . '.cache';
    }
}
`
				)
			]),

			// Database Query Results
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Caching Database Results'),
				P({ class: 'text-muted-foreground' },
					`One common caching pattern is to cache expensive database query results
					to avoid repeated database calls.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

/**
 * Example of caching database results
 */
class UserService
{
    private FileCache $cache;

    public function __construct()
    {
        $this->cache = new FileCache('/tmp/user_cache');
    }

    public function getAllUsers(): array
    {
        $cacheKey = 'all_users';

        // Try to get from cache first
        $users = $this->cache->get($cacheKey);

        if ($users === null) {
            // Cache miss - get from database
            $users = $this->getUsersFromDatabase();

            // Store in cache for 1 hour (3600 seconds)
            $this->cache->put($cacheKey, $users, 3600);
        }

        return $users;
    }

    public function getUser(int $id): ?array
    {
        $cacheKey = "user_{$id}";

        $user = $this->cache->get($cacheKey);

        if ($user === null) {
            $user = $this->getUserFromDatabase($id);
            if ($user) {
                $this->cache->put($cacheKey, $user, 1800); // 30 minutes
            }
        }

        return $user;
    }

    public function updateUser(int $id, array $data): void
    {
        // Update in database
        $this->updateUserInDatabase($id, $data);

        // Invalidate cached data
        $this->cache->forget("user_{$id}");
        $this->cache->forget('all_users');
    }

    private function getUsersFromDatabase(): array
    {
        // Simulate expensive database query
        return ['user1', 'user2', 'user3'];
    }

    private function getUserFromDatabase(int $id): ?array
    {
        // Simulate database query
        return ['id' => $id, 'name' => "User {$id}"];
    }

    private function updateUserInDatabase(int $id, array $data): void
    {
        // Simulate database update
    }
}
`
				)
			]),

			// Best Practices
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Caching Best Practices'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("Cache only data that is expensive to compute or retrieve"),
					Li("Use appropriate TTL values - not too short or too long"),
					Li("Implement cache invalidation when data changes"),
					Li("Monitor cache hit rates to measure effectiveness"),
					Li("Be careful with memory usage when caching large objects"),
					Li("Consider using cache keys that are easy to invalidate"),
					Li("Implement fallback mechanisms when cache is unavailable"),
					Li("Use consistent naming conventions for cache keys")
				])
			]),

			// Cache Invalidation Strategies
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Cache Invalidation Strategies'),
				P({ class: 'text-muted-foreground' },
					`Different strategies for keeping cached data fresh and accurate:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("Time-based expiration (TTL)"),
					Li("Manual invalidation when data changes"),
					Li("Tag-based invalidation for related data"),
					Li("Version-based invalidation"),
					Li("Write-through caching (update cache when data changes)"),
					Li("Write-behind caching (update cache and database separately)")
				]),
				CodeBlock(
`// Example of tag-based cache invalidation concept
class TaggedCache extends FileCache
{
    private array $tags = [];

    public function putWithTags(string $key, mixed $value, array $tags, int $ttl = 0): void
    {
        $this->put($key, $value, $ttl);

        // Store tag associations
        foreach ($tags as $tag) {
            if (!isset($this->tags[$tag])) {
                $this->tags[$tag] = [];
            }
            $this->tags[$tag][] = $key;
        }
    }

    public function invalidateByTag(string $tag): void
    {
        if (isset($this->tags[$tag])) {
            foreach ($this->tags[$tag] as $key) {
                $this->forget($key);
            }
            unset($this->tags[$tag]);
        }
    }
}

// Usage
$cache = new TaggedCache();
$cache->putWithTags('user_1', $userData, ['users', 'user_1'], 3600);
$cache->putWithTags('user_2', $userData2, ['users', 'user_2'], 3600);

// Invalidate all user caches
$cache->invalidateByTag('users');
`
				)
			])
		]
	);

export default CachingPage;
