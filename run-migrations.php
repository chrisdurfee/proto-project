<?php declare(strict_types=1);

// Simple migration runner script
require __DIR__ . '/vendor/autoload.php';

try {
    echo "Initializing Proto framework...\n";

    // Initialize the API system which will bootstrap everything we need
    Proto\Api\ApiRouter::initialize();

    echo "Running database migrations...\n";

    // Initialize the migration guide
    $guide = new Proto\Database\Migrations\Guide();

    // Run all pending migrations
    $result = $guide->run();

    if ($result) {
        echo "Migrations completed successfully!\n";
    } else {
        echo "Migrations failed or no pending migrations found.\n";
    }

} catch (Exception $e) {
    echo "Error running migrations: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
