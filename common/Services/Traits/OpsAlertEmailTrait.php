<?php declare(strict_types=1);

namespace Common\Services\Traits;

/**
 * OpsAlertEmailTrait
 *
 * Shared opt-in gate for cron-driven ops alert emails (error spikes,
 * slow-query spikes). Alerts only send when email.alertsEnabled is
 * explicitly true — local/dev and personal SMTP inboxes should leave
 * it off so unresolved error volume does not spam every 15 minutes.
 *
 * @package Common\Services\Traits
 */
trait OpsAlertEmailTrait
{
	/**
	 * Whether ops alert emails are enabled in config.
	 *
	 * @return bool
	 */
	protected function alertsEnabled(): bool
	{
		$emailConfig = env('email');
		return ($emailConfig->alertsEnabled ?? false) === true;
	}

	/**
	 * Ops alert recipient (securityAlerts, then default). Null when
	 * alerts are disabled or no recipient is configured.
	 *
	 * @return string|null
	 */
	protected function getAlertRecipient(): ?string
	{
		if (!$this->alertsEnabled())
		{
			return null;
		}

		$emailConfig = env('email');
		$to = $emailConfig->securityAlerts ?? $emailConfig->default ?? null;
		if (!is_string($to) || trim($to) === '')
		{
			return null;
		}

		return trim($to);
	}
}
