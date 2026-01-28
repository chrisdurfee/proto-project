<?php declare(strict_types=1);
/**
 * PHPUnit Bootstrap File
 *
 * This file ensures the environment is correctly configured for testing
 * before the framework initializes. This prevents the Config class from
 * defaulting to 'prod' or 'dev' when running tests from CLI, which would
 * cause connection errors if the 'mariadb' host is not resolvable locally.
 */

require dirname(__DIR__) . '/vendor/autoload.php';

use Proto\Base;
use Proto\Config;
use Proto\Database\ConnectionSettingsCache;
use Proto\Database\ConnectionCache;

// Define BASE_PATH as the project root
if (!defined('BASE_PATH'))
{
	define('BASE_PATH', dirname(__DIR__));
}

// Detect if running inside Docker
$inDocker = file_exists('/.dockerenv') || file_exists('/run/.containerenv');

// Initialize Config
$config = Config::getInstance();

// If NOT running in Docker, force 'testing' environment to use localhost connection
// This fixes local testing via VS Code or CLI on host machine
if (!$inDocker)
{
	$config->set('env', 'testing');

	// Clear cached connections to pick up new environment settings
	ConnectionSettingsCache::clearAll();
	ConnectionCache::clear();
}

// Disable Redis cache driver to prevent connection issues in CI/local testing
// where Redis hostname may not resolve
$cacheConfig = $config->get('cache');
if ($cacheConfig)
{
	$cacheConfig->driver = null;
	$config->set('cache', $cacheConfig);
}

// Enable dbCaching for transaction support (ensures test isolation)
$config->set('dbCaching', true);

/**
 * Initialize the Proto framework.
 * This loads modules and services.
 */
new Base();

// Ensure testing environment persists after Base init (if not in Docker)
if (!$inDocker)
{
	setEnv('env', 'testing');
	ConnectionSettingsCache::clearAll();
	ConnectionCache::clear();
}
