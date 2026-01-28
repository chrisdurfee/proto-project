<?php declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use Proto\Base;
use Proto\Error\Error;
use Proto\Database\ConnectionSettingsCache;
use Proto\Database\ConnectionCache;

/**
 * Enable error tracking for debugging
 */
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

Error::disable();

/**
 * Override environment from APP_ENV if set (for CI/testing)
 * The Config class uses HTTP_HOST to detect environment, but in CLI
 * we need to explicitly set it based on APP_ENV environment variable.
 */
$isTesting = isset($_SERVER['APP_ENV']) && $_SERVER['APP_ENV'] === 'testing';

/**
 * Initialize the Proto framework
 */
new Base();

/**
 * Set environment after base init but before DB connection.
 * Clear any cached connection settings to ensure the correct
 * environment's database settings are used.
 */
if ($isTesting)
{
	setEnv('env', 'testing');
	ConnectionSettingsCache::clearAll();
	ConnectionCache::clear();
	echo "Running migrations in TESTING environment\n";
}
else
{
	echo "Running migrations in " . strtoupper(env('env')) . " environment\n";
}

// Show current configuration
echo "Configuration check:\n";
$config = \Proto\Config::getInstance();
$dbSettings = $config->getDBSettings('default');
echo "  Environment: " . env('env') . "\n";
echo "  Database host: " . ($dbSettings->host ?? 'not set') . "\n";
echo "  Database name: " . ($dbSettings->database ?? 'not set') . "\n";
echo "  Database port: " . ($dbSettings->port ?? 'not set') . "\n";
echo "  Database user: " . ($dbSettings->username ?? 'not set') . "\n";

// Verify database connection before running migrations
echo "\nVerifying database connection...\n";
try {
    $db = \Proto\Database\Database::getConnection('default', true);
    if ($db) {
        $dbInfo = $db->first('SELECT DATABASE() as db, USER() as user, @@hostname as host');
        echo "✓ Connected to database: {$dbInfo->db}\n";
        echo "  User: {$dbInfo->user}\n";
        echo "  Host: {$dbInfo->host}\n";
    } else {
        echo "ERROR: Could not establish database connection\n";
        exit(1);
    }
} catch (Throwable $e) {
    echo "ERROR: Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Now try to run Proto migrations
echo "\nRunning Proto migrations...\n";

echo "About to create Guide instance...\n";
// Use Proto's migration system
try {
    $guide = new \Proto\Database\Migrations\Guide();
    echo "Guide created successfully\n";

    // Try to get new migrations to debug
    $reflection = new ReflectionClass($guide);
    $method = $reflection->getMethod('getNewMigrations');
    $method->setAccessible(true);

    echo "About to get new migrations...\n";
    $migrations = $method->invoke($guide);
    echo "Found " . count($migrations) . " migrations\n";

    echo "Running migrations...\n";
    $result = $guide->run();
    echo "Migration run completed...\n";
    echo "Migration result: " . var_export($result, true) . "\n";

} catch (Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

if ($result)
{
    echo "Migrations completed successfully!\n";
}
else
{
    echo "No migrations to run or migrations failed.\n";
}

echo "Database setup complete!\n";