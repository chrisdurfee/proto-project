<?php declare(strict_types=1);

namespace Common\Services;

use Common\Email\Alerts\ErrorSpikeAlertEmail;
use Proto\Database\Database;
use Proto\Dispatch\Dispatcher;

/**
 * ErrorLogAlertService
 *
 * Watches proto_error_log for a spike in new, unresolved rows within a
 * short trailing window and emails an ops alert when the threshold is
 * crossed. Stateless by design (no "already alerted" bookkeeping) — the
 * cron interval itself is the throttle: it only fires again on the next
 * run if the volume is still elevated.
 *
 * @package Common\Services
 */
class ErrorLogAlertService extends Service
{
	/**
	 * New unresolved rows within the window that trigger an alert.
	 */
	protected const THRESHOLD = 20;

	/**
	 * Trailing window checked on every run, in minutes. Should match
	 * (or be slightly wider than) the cron interval.
	 */
	protected const WINDOW_MINUTES = 15;

	/**
	 * Checks proto_error_log for a spike and emails an alert if found.
	 *
	 * @return bool True if an alert was sent.
	 */
	public function checkAndAlert(): bool
	{
		$db = Database::getConnection('default');
		if ($db === null)
		{
			error_log('ErrorLogAlertService: no database connection.');
			return false;
		}

		$cutoff = date('Y-m-d H:i:s', time() - (self::WINDOW_MINUTES * 60));
		$count = 0;
		$sample = null;

		try
		{
			$countRow = $db->first(
				'SELECT COUNT(*) AS n FROM proto_error_log WHERE created_at >= ? AND resolved = 0',
				[$cutoff]
			);
			$count = (int)($countRow->n ?? 0);
			if ($count < self::THRESHOLD)
			{
				return false;
			}

			$sample = $db->first(
				'SELECT error_message, error_file FROM proto_error_log WHERE created_at >= ? AND resolved = 0 ORDER BY id DESC LIMIT 1',
				[$cutoff]
			);
		}
		catch (\Throwable $e)
		{
			error_log('ErrorLogAlertService: check failed: ' . $e->getMessage());
			return false;
		}

		// The spike itself is what matters; a failed notification
		// should never make the check look like it found nothing.
		try
		{
			$this->sendAlert($count, $sample->error_message ?? '', $sample->error_file ?? '');
		}
		catch (\Throwable $e)
		{
			error_log('ErrorLogAlertService: alert dispatch failed: ' . $e->getMessage());
		}

		return true;
	}

	/**
	 * Emails the ops alert address configured for security alerts,
	 * falling back to the general notice address.
	 *
	 * @param int $count
	 * @param string $sampleMessage
	 * @param string $sampleFile
	 * @return void
	 */
	protected function sendAlert(int $count, string $sampleMessage, string $sampleFile): void
	{
		$emailConfig = env('email');
		$to = $emailConfig->securityAlerts ?? $emailConfig->default ?? null;
		if (!$to)
		{
			error_log('ErrorLogAlertService: no alert recipient configured (email.securityAlerts / email.default).');
			return;
		}

		$settings = (object)[
			'to' => $to,
			'subject' => "Error spike: {$count} errors in " . self::WINDOW_MINUTES . ' minutes',
			'template' => ErrorSpikeAlertEmail::class
		];

		Dispatcher::email($settings, (object)[
			'count' => $count,
			'windowMinutes' => self::WINDOW_MINUTES,
			'sampleMessage' => $sampleMessage,
			'sampleFile' => $sampleFile
		]);
	}
}
