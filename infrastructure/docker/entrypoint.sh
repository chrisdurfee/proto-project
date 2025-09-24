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

# Wait for important app files to appear (helps when host bind-mounts may take a
# short while to become available). This prevents running composer/migrations
# before the source files are visible inside the container.
WAIT_FOR_SECONDS=${WAIT_FOR_SECONDS:-30}
count=0
echo "⏳ Waiting up to ${WAIT_FOR_SECONDS}s for application files..."
while [ $count -lt $WAIT_FOR_SECONDS ] && ( [ ! -f "/var/www/html/composer.json" ] || [ ! -f "/var/www/html/infrastructure/scripts/run-migrations.php" ] ); do
    sleep 1
    count=$((count+1))
    if [ $((count % 5)) -eq 0 ]; then
        echo "... waited ${count}s so far"
    fi
done

if [ ! -f "/var/www/html/composer.json" ] || [ ! -f "/var/www/html/infrastructure/scripts/run-migrations.php" ]; then
    echo "⚠️ Required application files still missing after ${count}s."
    echo "   Present:"
    [ -f "/var/www/html/composer.json" ] && echo "    - composer.json: yes" || echo "    - composer.json: MISSING"
    [ -f "/var/www/html/infrastructure/scripts/run-migrations.php" ] && echo "    - run-migrations.php: yes" || echo "    - run-migrations.php: MISSING"
    echo "   Proceeding but migrations may fail."
fi

# Ensure dependencies are installed BEFORE running migrations. When the project is
# bind-mounted from the host, the image-built vendor/ can be absent at runtime.
if [ ! -f "vendor/autoload.php" ]; then
    if [ -f "composer.json" ]; then
        echo "❌ Autoloader not found; running composer install to provision vendor/..."
        composer install --no-interaction --no-dev --optimize-autoloader || echo "⚠️ Composer install failed"
    else
        echo "⚠️ composer.json not present; skipping composer install (expected in some workflows)"
    fi
fi

# Check if we need to run migrations (only if requested via env var)
if [ "$AUTO_MIGRATE" = "true" ]; then
    echo "📊 Running database migrations..."
    php infrastructure/scripts/run-migrations.php || echo "⚠️ Migration failed or skipped"
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

# Enable production Apache configuration if in production mode
if [ "${APP_ENV}" = "production" ] || [ "${ENVIRONMENT}" = "production" ]; then
    echo "⚙️ Enabling production Apache configuration with subdomain support"

    # Enable subdomain configuration for production
    if [ -f /etc/apache2/sites-available/002-subdomain.conf ]; then
        a2ensite 002-subdomain >/dev/null 2>&1 || true
        echo "✅ Subdomain configuration enabled"
    fi

    # Enable production site if available
    if [ -f /etc/apache2/sites-available/001-production.conf ]; then
        a2ensite 001-production >/dev/null 2>&1 || true
    fi

    # Disable default site
    a2dissite 000-default >/dev/null 2>&1 || true

    echo "✅ Production Apache configuration active"
else
    echo "⚙️ Using development Apache configuration"
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
