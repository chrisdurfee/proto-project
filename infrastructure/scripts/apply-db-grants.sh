#!/usr/bin/env bash
#
# apply-db-grants.sh — idempotently (re-)applies create-app-db-user.sql
# against the live database using real credentials from
# common/Config/.env.
#
# Why this exists: create-app-db-user.sql is a placeholder template
# (__APP_RUNTIME_USER__, etc.) that historically had to be hand-edited
# and piped into `mariadb -uroot` manually — a step that is easy to
# forget after a fresh `docker compose down -v` / new environment setup,
# silently leaving `proto_runtime_user` (and `proto_slowlog_maint`)
# without the grants the app depends on at runtime (e.g. the slow-query
# alert cron's SELECT on `mysql.slow_log`). This script closes that gap
# by resolving the template from config and applying it in one command,
# so the grants can be (re-)established the same way every time —
# during initial setup AND after any environment rebuild.
#
# Every statement in the template uses `CREATE USER IF NOT EXISTS` and
# additive `GRANT`, so re-running this against an already-provisioned
# database is a safe no-op.
#
# Usage (from repo root, after `./infrastructure/scripts/run.sh sync-config`):
#   ./infrastructure/scripts/apply-db-grants.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEMPLATE="${SCRIPT_DIR}/create-app-db-user.sql"
CONTAINER="${DB_CONTAINER:-${CONTAINER_PREFIX:-proto}-mariadb}"

if [[ ! -f "${TEMPLATE}" ]]; then
	echo "ERROR: ${TEMPLATE} not found." >&2
	exit 1
fi

if ! command -v node >/dev/null 2>&1; then
	echo "ERROR: node is required to read common/Config/.env." >&2
	exit 1
fi

# Pull the real credentials straight out of the single source of truth
# (common/Config/.env) instead of duplicating them in a second file.
CONFIG_JSON="$(node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('${REPO_ROOT}/common/Config/.env', 'utf8'));
const env = cfg.env === 'dev' ? 'dev' : 'prod';
const runtime = cfg.connections?.default?.[env];
const maint = cfg.connections?.slowLogMaintenance?.[env];
if (!runtime || !runtime.username || !runtime.password) {
	console.error('Missing connections.default.' + env + ' credentials in common/Config/.env');
	process.exit(1);
}
console.log(JSON.stringify({
	rootPassword: cfg.connections?.default?.rootPassword || '',
	appDatabase: runtime.database || 'proto',
	runtimeUser: runtime.username,
	runtimePassword: runtime.password,
	maintUser: maint?.username || '',
	maintPassword: maint?.password || ''
}));
")"

ROOT_PASSWORD="$(node -e "console.log(JSON.parse(process.argv[1]).rootPassword)" "${CONFIG_JSON}")"
APP_DATABASE="$(node -e "console.log(JSON.parse(process.argv[1]).appDatabase)" "${CONFIG_JSON}")"
RUNTIME_USER="$(node -e "console.log(JSON.parse(process.argv[1]).runtimeUser)" "${CONFIG_JSON}")"
RUNTIME_PASSWORD="$(node -e "console.log(JSON.parse(process.argv[1]).runtimePassword)" "${CONFIG_JSON}")"
MAINT_USER="$(node -e "console.log(JSON.parse(process.argv[1]).maintUser)" "${CONFIG_JSON}")"
MAINT_PASSWORD="$(node -e "console.log(JSON.parse(process.argv[1]).maintPassword)" "${CONFIG_JSON}")"

if [[ -z "${ROOT_PASSWORD}" ]]; then
	echo "ERROR: connections.default.rootPassword is not set in common/Config/.env." >&2
	exit 1
fi

# Resolve placeholders into a temp file rather than mutating the
# checked-in template. The slow-log maintenance placeholders are left
# untouched (substituted with empty strings removed as no-ops) when that
# connection isn't configured, so this stays safe to run before that
# feature exists in a given environment.
RESOLVED="$(mktemp)"
trap 'rm -f "${RESOLVED}"' EXIT

sed \
	-e "s/__APP_RUNTIME_USER__/${RUNTIME_USER}/g" \
	-e "s/__APP_RUNTIME_PASSWORD__/${RUNTIME_PASSWORD}/g" \
	-e "s/__APP_DATABASE__/${APP_DATABASE}/g" \
	-e "s/__SLOWLOG_MAINT_USER__/${MAINT_USER:-proto_slowlog_maint}/g" \
	-e "s/__SLOWLOG_MAINT_PASSWORD__/${MAINT_PASSWORD:-changeme}/g" \
	"${TEMPLATE}" > "${RESOLVED}"

echo "Applying ${TEMPLATE} to ${CONTAINER} (idempotent — safe to re-run)..."
docker exec -i "${CONTAINER}" mariadb -uroot -p"${ROOT_PASSWORD}" < "${RESOLVED}"

echo "✅ Grants applied. Verifying..."
docker exec "${CONTAINER}" mariadb -uroot -p"${ROOT_PASSWORD}" -e "SHOW GRANTS FOR '${RUNTIME_USER}'@'%';"
