<?php declare(strict_types=1);

/**
 * run-routine.php
 *
 * Thin wrapper around Proto's Cron runner that ensures the project
 * autoloader is loaded before the routine class is resolved.
 *
 * Usage (from project root):
 *   php infrastructure/scripts/run-routine.php "Fully\\Qualified\\RoutineClass"
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Proto\Automation\Cron\Cron;

$routine = $argv[1] ?? null;
Cron::run(routine: $routine);
