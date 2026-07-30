<?php declare(strict_types=1);

/**
 * sync-cron-registry.php
 *
 * Upserts cron_jobs rows from infrastructure/docker/cron definitions.
 *
 * Usage (from project root):
 *   php infrastructure/scripts/sync-cron-registry.php
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Common\Automation\Services\CronRegistryService;

$synced = CronRegistryService::syncAll();
echo 'Synced ' . $synced . " cron job(s).\n";
