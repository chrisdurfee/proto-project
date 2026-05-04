<?php declare(strict_types=1);

/**
 * run-event-import.php
 *
 * Bootstrap script for the daily automotive event import routine.
 * Executes inside the web container, typically triggered by cron.
 *
 * Usage (inside container):
 *   php infrastructure/scripts/run-event-import.php
 *
 * Recommended crontab entry (host machine, daily at midnight):
 *   0 0 * * * docker compose -f /path/to/infrastructure/docker-compose.yaml \
 *       exec -T web php infrastructure/scripts/run-event-import.php \
 *       >> /var/log/rally-event-import.log 2>&1
 */

$rootDir = dirname(__DIR__, 2);
require_once $rootDir . '/vendor/autoload.php';

use Proto\Base;
use Proto\Error\Error;
use Modules\Community\Event\Automation\EventImportRoutine;

/**
 * Bootstrap the Proto framework for CLI usage.
 */
Error::disable();
new Base();

echo '[' . date('Y-m-d H:i:s') . '] Starting EventImportRoutine...' . PHP_EOL;

$routine = new EventImportRoutine();
$routine->run();

echo '[' . date('Y-m-d H:i:s') . '] EventImportRoutine complete.' . PHP_EOL;
