#!/bin/bash

# Docker container startup script for Proto Project
echo "🚀 Starting Proto Project container..."

# Function to check if a service is ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_wait=30
    local count=0

    echo "⏳ Waiting for $service_name to be ready..."
    while ! nc -z "$host" "$port" >/dev/null 2>&1; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $max_wait ]; then
            echo "⚠️ Timeout waiting for $service_name"
            break
        fi
    done

    if [ $count -lt $max_wait ]; then
        echo "✅ $service_name is ready"
    fi
}

# Wait for dependencies if they exist
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
    wait_for_service "$DB_HOST" "${DB_PORT:-3306}" "Database"
fi

if [ -n "$REDIS_HOST" ] && [ "$REDIS_HOST" != "localhost" ]; then
    wait_for_service "$REDIS_HOST" "${REDIS_PORT:-6379}" "Redis"
fi

# Runtime initialization (safe operations only)
echo "� Running startup initialization..."

# Check if we need to run migrations (only if requested via env var)
if [ "$AUTO_MIGRATE" = "true" ]; then
    echo "📊 Running database migrations..."
    php infrastructure/scripts/run-migrations.php || echo "⚠️ Migration failed or skipped"
fi

# Verify critical files exist
if [ ! -f "vendor/autoload.php" ]; then
    echo "❌ Autoloader not found! Running composer install..."
    composer install --no-dev --optimize-autoloader
fi

# Final health check
echo "🔍 Performing health checks..."
php -r "
try {
    require_once 'vendor/autoload.php';
    echo '✅ Autoloader working\n';
} catch (Exception \$e) {
    echo '❌ Autoloader error: ' . \$e->getMessage() . '\n';
    exit(1);
}
"

echo "✅ Initialization complete, starting Apache..."
echo "🌐 Application will be available on port 80"

# Enable Apache MPM tuning config if mounted
if [ -f /etc/apache2/conf-available/mpm-tuning.conf ]; then
    a2enconf mpm-tuning >/dev/null 2>&1 || true
fi

# Dynamic PHP performance tuning based on APP_ENV
PHP_PERF_FILE="/usr/local/etc/php/conf.d/zz-env-performance.ini"
if [ "${APP_ENV}" = "production" ]; then
    echo "⚙️ Applying production PHP performance optimizations";
    cat > "$PHP_PERF_FILE" <<'EOF'
; Runtime generated (production)
opcache.validate_timestamps=0
opcache.revalidate_freq=0
opcache.preload=/var/www/html/preload.php
opcache.preload_user=www-data
opcache.save_comments=1
opcache.max_wasted_percentage=5
EOF
else
    echo "⚙️ Applying development PHP performance settings";
    cat > "$PHP_PERF_FILE" <<'EOF'
; Runtime generated (development)
opcache.validate_timestamps=1
opcache.revalidate_freq=1
opcache.max_wasted_percentage=15
EOF
fi

if [ ! -f /var/www/html/preload.php ]; then
    echo "<?php // dynamic preload stub ?>" > /var/www/html/preload.php
fi

php -i | grep -E 'opcache.jit_buffer_size|opcache.jit=|validate_timestamps|revalidate_freq' || true

# Start Apache in foreground
exec apache2-foreground
