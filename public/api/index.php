<?php declare(strict_types=1);
require __DIR__ . '/../../vendor/autoload.php';

/**
 * CRITICAL: PHP-FPM workers are long-lived (pm.max_requests = 1000), and
 * several Proto singletons cache their state in plain static properties
 * that are only ever set once per worker (e.g. `DatabaseSession::start()`
 * short-circuits on `static::$token !== null`). Without an explicit reset
 * between requests, the FIRST visitor a given worker serves has their
 * session, CSRF token, and resolved public IP silently reused for EVERY
 * later request that worker handles — a completely different, unrelated
 * visitor inherits someone else's session/identity. This was caught by
 * observing `/api/auth/csrf-token` return an identical token across
 * independent, cookie-less requests.
 *
 * The installed protoframework/proto version ships no public reset() hooks
 * for Session / DatabaseSession / Gate, so the known-problematic static
 * caches are cleared directly via Reflection at the end of every request so
 * the next request on this worker always starts clean.
 */
register_shutdown_function(static function (): void
{
	if (class_exists(\Proto\Http\Request::class))
	{
		\Proto\Http\Request::reset();
	}

	if (class_exists(\Proto\Http\PublicIp::class))
	{
		\Proto\Http\PublicIp::reset();
	}

	$resetStatic = static function (string $class, string $property): void
	{
		if (!class_exists($class))
		{
			return;
		}

		try
		{
			$ref = new \ReflectionProperty($class, $property);
			$ref->setAccessible(true);
			$ref->setValue(null, null);
		}
		catch (\ReflectionException $e)
		{
			// Property doesn't exist on this framework version — nothing to reset.
		}
	};

	$resetStatic(\Proto\Http\Session::class, 'instance');
	$resetStatic(\Proto\Http\Session::class, 'type');
	$resetStatic(\Proto\Http\Session\DatabaseSession::class, 'token');
	$resetStatic(\Proto\Http\Session\Adapter::class, 'instance');
	$resetStatic(\Proto\Auth\Gates\Gate::class, 'session');
});

Proto\Api\ApiRouter::initialize();
