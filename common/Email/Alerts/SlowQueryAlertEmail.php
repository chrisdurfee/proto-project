<?php declare(strict_types=1);
namespace Common\Email\Alerts;

use Common\Email\BasicEmail;

/**
 * SlowQueryAlertEmail
 *
 * Ops notification sent when the count of genuinely slow queries
 * (query_time >= long_query_time, per mysql.slow_log) jumps by an unusual
 * amount in a short window (see SlowQueryAlertService).
 *
 * @package Common\Email\Alerts
 */
class SlowQueryAlertEmail extends BasicEmail
{
	/**
	 * Adds the body to the email.
	 *
	 * @return string
	 */
	protected function addBody(): string
	{
		$count = (int)($this->get('count') ?? 0);
		$elapsedMinutes = (int)($this->get('elapsedMinutes') ?? 0);
		$sampleSql = htmlspecialchars((string)($this->get('sampleSql') ?? ''), ENT_QUOTES, 'UTF-8');
		$sampleTime = (float)($this->get('sampleTime') ?? 0);
		$sampleDb = htmlspecialchars((string)($this->get('sampleDb') ?? ''), ENT_QUOTES, 'UTF-8');

		$sampleBlock = $sampleSql !== ''
			? "<p><strong>Slowest offender ({$sampleDb}, {$sampleTime}s):</strong><br><code>{$sampleSql}</code></p>"
			: '<p>Review the MariaDB slow query log (slow.log or mysql.slow_log) for the actual offenders.</p>';

		return <<<HTML
<tr>
	<td style="vertical-align:top;" class="sub-container">
		{$this->addEyebrow('ALERT · SLOW QUERY SPIKE')}
		<h1>{$count} genuinely slow queries in the last {$elapsedMinutes} minutes.</h1>
		<p>Queries in mysql.slow_log with an actual query_time at or above long_query_time grew faster than usual.</p>
		{$sampleBlock}
		<p>Check `slow.log` in the mariadb container and consider EXPLAIN on recently changed endpoints.</p>
	</td>
</tr>
{$this->addCompanySignature()}
HTML;
	}
}
