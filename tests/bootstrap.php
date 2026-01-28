<?php declare(strict_types=1);
/**
 * PHPUnit Bootstrap File
 *
 * This bootstrap file ensures the Proto framework is properly initialized
 * before any tests run. It must load the Base class first so that the
 * env() and setEnv() global functions are available.
 */

require dirname(__DIR__) . '/vendor/autoload.php';

use Proto\Base;
use Proto\Config;
use Proto\Database\ConnectionSettingsCache;
use Proto\Database\ConnectionCache;

/**
 * Set testing environment variables BEFORE initializing the framework.
 */
$_SERVER['APP_ENV'] = 'testing';
$_ENV['APP_ENV'] = 'testing';

/**
 * Define BASE_PATH before Config can be loaded.
 * This is normally done by Base::setBasePath(), but we need it early.
 */
if (!defined('BASE_PATH'))
{
	define('BASE_PATH', dirname(__DIR__));
}

/**
 * Pre-configure the Config singleton to disable Redis cache
 * before Base initialization triggers module loading.
 */
$config = Config::getInstance();
$config->set('env', 'testing');

// Disable Redis cache driver to prevent connection issues in CI
$cacheConfig = $config->get('cache');
if ($cacheConfig)
{
	$cacheConfig->driver = null;
	$config->set('cache', $cacheConfig);
}

/**
 * Clear any cached connection settings before Base init
 */
ConnectionSettingsCache::clearAll();
ConnectionCache::clear();

/**
 * Initialize the Proto framework.
 * This loads modules and services.
 */
new Base();

/**
 * Ensure testing environment is set after Base init
 */
setEnv('env', 'testing');
ConnectionSettingsCache::clearAll();
ConnectionCache::clear();
