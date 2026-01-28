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

// Detect if running inside Docker (where 'mariadb' hostname resolves)
$inDocker = file_exists('/.dockerenv') || file_exists('/run/.containerenv');

// Check if APP_ENV is explicitly set (e.g., in CI)
$appEnv = $_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? null;
$forceTesting = ($appEnv === 'testing') || !$inDocker;

// Initialize Config BEFORE Base to configure environment
$config = Config::getInstance();

// Set testing environment when not in Docker OR when APP_ENV=testing
if ($forceTesting)
{
	$config->set('env', 'testing');
}

// Disable Redis cache driver to prevent connection issues in CI/local testing
$cacheConfig = $config->get('cache');
if ($cacheConfig)
{
	$cacheConfig->driver = null;
	$config->set('cache', $cacheConfig);
}

// Enable dbCaching for transaction support (ensures test isolation)
$config->set('dbCaching', true);

// Clear cached connections BEFORE Base init
ConnectionSettingsCache::clearAll();
ConnectionCache::clear();

/**
 * Initialize the Proto framework.
 * This loads modules and services.
 */
new Base();

// Ensure testing environment persists after Base init
if ($forceTesting)
{
	setEnv('env', 'testing');
	ConnectionSettingsCache::clearAll();
	ConnectionCache::clear();
}
