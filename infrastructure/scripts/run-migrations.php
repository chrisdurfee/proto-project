<?php declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use Proto\Base;
use Proto\Error\Error;

/**
 * Enable error tracking for debugging
 */
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Error::disable();

/**
 * Initialize the Proto framework
 */
new Base();

// Now try to run Proto migrations
echo "Running Proto migrations...\n";

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