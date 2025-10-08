<?php declare(strict_types=1);

/**
 * PHPUnit Bootstrap for Proto Tests
 *
 * This bootstrap file ensures the test environment is properly configured
 * before any tests run, particularly for WSL environments where the database
 * connection needs special handling.
 */

// Set testing environment BEFORE anything else (before autoloader)
putenv('APP_ENV=testing');
putenv('DB_CONNECTION=testing');
putenv('SESSION=file');

$_ENV['SESSION'] = 'file';
$_ENV['APP_ENV'] = 'testing';
$_ENV['DB_CONNECTION'] = 'testing';

// Load composer autoloader
require __DIR__ . '/vendor/autoload.php';

// Hook into Proto's setEnv to override session during testing
// This ensures file sessions are used instead of database sessions
if (!function_exists('testSessionOverride')) {
	function testSessionOverride() {
		// Override session configuration for tests
		if (function_exists('setEnv')) {
			setEnv('session', 'file');
		}
	}
	testSessionOverride();
}
