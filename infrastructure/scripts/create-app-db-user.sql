-- create-app-db-user.sql — least-privilege runtime DB user (SOC 2 CC6.1)
--
-- The MariaDB Docker image auto-grants ALL PRIVILEGES on the app schema to
-- the MARIADB_USER (proto_app_user) on first init, because that same user
-- also runs migrations (DDL). That means the request-serving app process
-- has DDL rights it never needs at runtime — a wider blast radius than
-- necessary if the app is ever compromised (SQLi, RCE, etc.).
--
-- This script creates a SECOND user — a runtime-only account with just the
-- DML grants the app needs (SELECT/INSERT/UPDATE/DELETE). Migrations keep
-- using proto_app_user (or root); only the request-time `default` connection
-- should be pointed at the new user.
--
-- Preferred usage — resolves the placeholders below from the live
-- common/Config/.env and applies them in one idempotent step (safe to
-- re-run after every environment/container rebuild, since a fresh
-- `mariadb_data` volume starts with none of these users/grants):
--   ./infrastructure/scripts/run.sh apply-db-grants
--
-- Manual usage (if you need to run it by hand — replace the placeholders
-- first):
--   docker exec -i ${CONTAINER_PREFIX:-proto}-mariadb mariadb -uroot -p"${DB_ROOT_PASSWORD}" \
--     < infrastructure/scripts/create-app-db-user.sql
--
-- Then, in common/Config/.env, add a runtime-only credential pair (do NOT
-- reuse proto_app_user's password) and repoint `connections.default`
-- username/password at it for the web/app process, while migrations keep
-- running as proto_app_user (which still has ALTER/CREATE/DROP).
--
-- All host patterns below are '%' (matching proto_app_user's own grants —
-- see `SHOW GRANTS FOR 'proto_app_user'@'%'`), deliberately NOT scoped to
-- a specific container IP: Docker recreates containers (rebuilds,
-- `docker compose up` after a config change, etc.) with a new internal
-- bridge-network IP every time, which would silently break a
-- single-IP-scoped grant on the next recreate.
--
-- Placeholders below — replace before running manually (apply-db-grants.sh
-- fills these in automatically from common/Config/.env):
--   __APP_RUNTIME_USER__      e.g. proto_runtime_user
--   __APP_RUNTIME_PASSWORD__  a strong, unique password (never proto_app_user's)
--   __APP_DATABASE__          e.g. proto

CREATE USER IF NOT EXISTS '__APP_RUNTIME_USER__'@'%' IDENTIFIED BY '__APP_RUNTIME_PASSWORD__';

GRANT SELECT, INSERT, UPDATE, DELETE ON `__APP_DATABASE__`.* TO '__APP_RUNTIME_USER__'@'%';

-- Narrow, read-only exception: SlowQueryAlertService filters the real
-- query_time column on mysql.slow_log (see performance.cnf's
-- `log_output=FILE,TABLE`) to tell genuinely slow (>= long_query_time)
-- queries apart from the much higher-volume log_queries_not_using_indexes
-- noise, which SHOW GLOBAL STATUS LIKE 'Slow_queries' cannot distinguish.
-- Scoped to this single system table only — not `mysql`.* — and read-only
-- (no DELETE; retention/pruning of mysql.slow_log is an ops task, not
-- something this runtime user should do).
GRANT SELECT ON `mysql`.`slow_log` TO '__APP_RUNTIME_USER__'@'%';

-- Explicitly no CREATE/ALTER/DROP/INDEX/GRANT — migrations must run under
-- proto_app_user (or root), never under this runtime user.

FLUSH PRIVILEGES;

-- Verify grants:
--   SHOW GRANTS FOR '__APP_RUNTIME_USER__'@'%';

-- ---------------------------------------------------------------------------
-- Dedicated slow-log maintenance user (SlowQueryLogPruneService)
-- ---------------------------------------------------------------------------
-- `mysql.slow_log` has no automatic rotation and grows unbounded (see
-- performance.cnf's `log_output=FILE,TABLE`). Pruning it needs
-- SELECT/INSERT/CREATE/ALTER/DROP on a handful of table names under
-- `mysql.*` — far beyond the runtime user's read-only grant above, and
-- deliberately NOT folded into it (same least-privilege reasoning as the
-- runtime/migrations split: the always-running web process should never
-- hold DDL rights on `mysql.*`, even for this one maintenance table).
--
-- Why these specific privileges: `mysql.slow_log` uses the CSV engine and
-- MariaDB refuses any direct DELETE/INSERT/UPDATE against it while it's
-- bound as the active log table ("You can't use locks with log tables" —
-- not a privilege error, the server rejects it for every user including
-- root). The documented workaround is to disable logging first
-- (`SET GLOBAL slow_query_log=OFF`), but that requires the broad `SUPER`
-- privilege. SlowQueryLogPruneService instead atomically RENAMEs a
-- pre-built, already-pruned replacement table into the `slow_log` name
-- (see its class docblock) — logging is never interrupted and `SUPER` is
-- never needed, at the cost of needing CREATE/ALTER/DROP/INSERT on a few
-- fixed working-table names instead of just DELETE.
--
-- This runs under its own `connections.slowLogMaintenance` credential
-- (see common/Config/.env), never the runtime `default` connection or the
-- `proto_app_user` / `connections.migrations` account (that account's
-- ALTER/CREATE/DROP is scoped to the whole `proto` app schema for
-- migrations — much wider than this table-scoped job needs).
--
-- Usage (run once against the target database, replace the placeholders):
--   docker exec -i ${CONTAINER_PREFIX:-proto}-mariadb mariadb -uroot -p"${DB_ROOT_PASSWORD}" \
--     < infrastructure/scripts/create-app-db-user.sql
--
-- Placeholders below — replace before running:
--   __SLOWLOG_MAINT_USER__      e.g. proto_slowlog_maint
--   __SLOWLOG_MAINT_PASSWORD__  a strong, unique password (never reused)

CREATE USER IF NOT EXISTS '__SLOWLOG_MAINT_USER__'@'%' IDENTIFIED BY '__SLOWLOG_MAINT_PASSWORD__';

-- Read the live table to size up how much is eligible for pruning.
GRANT SELECT ON `mysql`.`slow_log` TO '__SLOWLOG_MAINT_USER__'@'%';

-- Rename-swap participants: `slow_log` and `slow_log_next` each act as
-- both a RENAME source and destination across the two runs that touch
-- them (see SlowQueryLogPruneService::swapAndPrune), so both need the
-- full ALTER+DROP (source) and CREATE+INSERT (destination) set. INSERT
-- on `slow_log` itself is required to seed rows via `INSERT ... SELECT`
-- before the swap makes it live again on a later run — MariaDB still
-- checks privileges on the destination table name even though the
-- table object is swapped out from under it moments later.
GRANT INSERT, CREATE, ALTER, DROP ON `mysql`.`slow_log` TO '__SLOWLOG_MAINT_USER__'@'%';
GRANT SELECT, INSERT, CREATE, ALTER, DROP ON `mysql`.`slow_log_next` TO '__SLOWLOG_MAINT_USER__'@'%';

-- `slow_log_prev` is only ever a RENAME destination (needs CREATE+INSERT)
-- and then a DROP target — no SELECT needed; the removed-row count is
-- derived from the other two tables instead of reading this one back.
GRANT CREATE, INSERT, DROP ON `mysql`.`slow_log_prev` TO '__SLOWLOG_MAINT_USER__'@'%';

-- Explicitly no SUPER, no wildcard grant on `mysql.*`, and no grant at
-- all on the `proto` app schema — scoped to exactly the three table
-- names this job touches. connections.slowLogMaintenance's default
-- database is `mysql` (not `proto`) for this same reason: this user
-- has nothing to do in the app schema.

FLUSH PRIVILEGES;

-- Verify grants:
--   SHOW GRANTS FOR '__SLOWLOG_MAINT_USER__'@'%';
