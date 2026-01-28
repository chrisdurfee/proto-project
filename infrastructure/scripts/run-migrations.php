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

// Run Proto migrations
echo "\nRunning Proto migrations...\n";

try
{
    $guide = new \Proto\Database\Migrations\Guide();
    $result = $guide->run();

    if ($result)
    {
        echo "Migrations completed successfully!\n";
    }
    else
    {
        echo "No new migrations to run.\n";
    }
}
catch (Throwable $e)
{
    echo "ERROR: Migration failed: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "Database setup complete!\n";