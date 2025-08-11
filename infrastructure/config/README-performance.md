# Performance Configuration

Centralized performance-related overrides for services ensuring we keep a single, transparent configuration surface. These files are mounted read-only into containers.

## MariaDB
`mariadb/conf.d/performance.cnf` augments runtime flags already passed via `docker-compose.yml`. Use this file for settings that can't be expressed cleanly as command-line flags or that you want to version explicitly. Keep sizes conservative; tune based on container memory.

Adjust: innodb_buffer_pool_size, max_connections, tmp_table_size, etc.

## Redis
`redis/redis.conf` replaces inline command flags, supporting safer command renames and future tuning. Password is still injected via the container command (`--requirepass`) so no secrets are stored here.

## PHP (OPcache/JIT)
Base defaults are baked into the image (Dockerfile). Environment-specific overrides are written dynamically at runtime inside the container (`zz-env-performance.ini`) by `entrypoint.sh` using APP_ENV.

## Principles
- No duplication of secrets
- Read-only mounts to prevent drift
- Safe to extend; prefer commenting rationale near changes

## Future Ideas
- Add optional query performance dashboard flags
- Introduce automated sizing based on cgroup memory limits
