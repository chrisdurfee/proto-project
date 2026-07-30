<?php declare(strict_types=1);
namespace Common\Email\Alerts;

use Common\Email\BasicEmail;

/**
 * ErrorSpikeAlertEmail
 *
 * Ops notification sent when proto_error_log receives an unusual
 * volume of new rows in a short window (see ErrorLogAlertService).
 *
 * @package Common\Email\Alerts
 */
class ErrorSpikeAlertEmail extends BasicEmail
{
	/**
	 * Adds the body to the email.
	 *
	 * @return string
	 */
	protected function addBody(): string
	{
		$count = (int)($this->get('count') ?? 0);
		$windowMinutes = (int)($this->get('windowMinutes') ?? 0);
		$sample = htmlspecialchars((string)($this->get('sampleMessage') ?? ''), ENT_QUOTES, 'UTF-8');
		$sampleFile = htmlspecialchars((string)($this->get('sampleFile') ?? ''), ENT_QUOTES, 'UTF-8');

		return <<<HTML
<tr>
	<td style="vertical-align:top;" class="sub-container">
		<h1>{$count} new errors in the last {$windowMinutes} minutes.</h1>
		<p>proto_error_log recorded an unusual volume of unresolved errors. Latest sample:</p>
		<p><strong>{$sampleFile}</strong><br>{$sample}</p>
		<p>Review recent rows in proto_error_log (env, error_message, error_file, created_at) to triage.</p>
	</td>
</tr>
{$this->addCompanySignature()}
HTML;
	}
}
