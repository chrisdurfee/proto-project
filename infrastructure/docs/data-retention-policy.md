# Data Retention Policy

Authoritative retention windows for automated data cleanup. Enforcement
lives in `common/Services/DataRetentionService.php`, invoked daily by
`common/Automation/Processes/DataRetentionRoutine.php`. **Update this
document and the service's `POLICIES` table together.**

Only leaf tables (nothing else references them by foreign key) may be
listed in the policy — deleting rows from a table other things point to
would orphan data.

## Retention windows

| Category | Table | Retention | Enforcement |
|---|---|---|---|
| **Auth security logs** | `login_log` | 1 year | `DataRetentionService` |
| | `login_attempts` | 90 days | `DataRetentionService` |
| **Framework error log** | `proto_error_log` | 90 days | `DataRetentionService` |
| **Analytics** | `user_activity_log` | 180 days | `DataRetentionService` |
| **Cron run logs** | `cron_runs` | Per-job (default 90 days) | `CronCleanupRoutine` |
| **Backups** | Database dumps | Per backup script retention | Backup script |

## Adding a new policy table

When a new module introduces a high-volume, append-only log/analytics
table:

1. Confirm the table is a leaf (no other table has a foreign key
   pointing at rows in it — otherwise deleting rows would orphan data).
2. Add `'table_name' => ['created_at_column', retentionDays]` to
   `DataRetentionService::POLICIES`.
3. Add a row to the table above explaining the retention window and
   why it was chosen.
4. If the table has domain-specific compliance requirements (e.g.
   longer retention for financial records, GDPR erasure rules for
   user-linked PII), document those separately near the feature that
   owns the table rather than folding special cases into this generic
   sweeper.

## Review cadence

Review this policy whenever a new high-volume log/analytics table is
introduced, and periodically alongside any compliance review.
