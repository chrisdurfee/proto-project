<?php declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use Proto\Base;
use Proto\Error\Error;

/**
 * Disable error tracking to prevent chicken-and-egg problem during migrations
 */
Error::disable();

/**
 * Initialize the Proto framework
 */
new Base();

// Now try to run Proto migrations
echo "Running Proto migrations...\n";

try
{
    // Use Proto's migration system
    $guide = new \Proto\Database\Migrations\Guide();
    $result = $guide->run();
    if ($result)
    {
        echo "Migrations completed successfully!\n";
    }
    else
    {
        echo "No migrations to run or migrations failed.\n";
    }
}
catch (Exception $e)
{
    echo "Migration error: " . $e->getMessage() . "\n";
}

echo "Database setup complete!\n";