#!/bin/bash

# Docker container startup script
echo "🚀 Starting Rally container..."

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
while [ $count -lt $WAIT_FOR_SECONDS ] && ( [ ! -f "/var/www/html/composer.json" ] || [ ! -f "/var/www/html/infrastructure/scripts/run-migrations.php" ] || [ ! -f "/var/www/html/common/Data.php" ] ); do
    sleep 1
    count=$((count+1))
    if [ $((count % 5)) -eq 0 ]; then
        echo "... waited ${count}s so far"
    fi
done

if [ ! -f "/var/www/html/composer.json" ] || [ ! -f "/var/www/html/infrastructure/scripts/run-migrations.php" ] || [ ! -f "/var/www/html/common/Data.php" ]; then
    echo "⚠️ Required application files still missing after ${count}s."
    echo "   Present:"
    [ -f "/var/www/html/composer.json" ] && echo "    - composer.json: yes" || echo "    - composer.json: MISSING"
    [ -f "/var/www/html/infrastructure/scripts/run-migrations.php" ] && echo "    - run-migrations.php: yes" || echo "    - run-migrations.php: MISSING"
    [ -f "/var/www/html/common/Data.php" ] && echo "    - common/Data.php: yes" || echo "    - common/Data.php: MISSING"
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
else
    echo "✅ Vendor directory exists"
    # Regenerate autoloader to pick up any new files from bind mounts
    if [ -f "composer.json" ]; then
        echo "🔄 Regenerating autoloader for bind-mounted directories..."
        composer dump-autoload --optimize || echo "⚠️ Autoloader regeneration failed"
    fi
fi

# Create file storage directories if they don't exist
echo "📁 Ensuring file storage directories exist..."
mkdir -p /var/www/html/public/files/users/profile 2>/dev/null || true
mkdir -p /var/www/html/common/files/attachments 2>/dev/null || true

# Add www-data to host user's group for bind-mount write access
echo "🔐 Configuring www-data permissions for bind-mounted directories..."
HOST_UID=${HOST_UID:-1000}
HOST_GID=${HOST_GID:-1000}

# Create host user's group if it doesn't exist
if ! getent group $HOST_GID > /dev/null 2>&1; then
    groupadd -g $HOST_GID hostgroup 2>/dev/null || true
fi

# Add www-data to the host user's group
usermod -a -G $HOST_GID www-data 2>/dev/null || true

# Set group write permissions on bind-mounted directories
chmod -R g+w /var/www/html/modules /var/www/html/common /var/www/html/public 2>/dev/null || true
chgrp -R $HOST_GID /var/www/html/modules /var/www/html/common /var/www/html/public 2>/dev/null || true

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

echo "✅ Initialization complete, starting services..."
echo "🌐 Application will be available on ports 80 (HTTP) and 443 (HTTPS)"

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
        echo "✅ Subdomain HTTP configuration enabled"
    fi

    # Enable subdomain SSL configuration
    if [ -f /etc/apache2/sites-available/003-subdomain-ssl.conf ]; then
        a2ensite 003-subdomain-ssl >/dev/null 2>&1 || true
        echo "✅ Subdomain HTTPS configuration enabled"
    fi

    # Disable production site to avoid conflicts with subdomain routing
    a2dissite 001-production >/dev/null 2>&1 || true

    # Disable default site
    a2dissite 000-default >/dev/null 2>&1 || true
    a2dissite default-ssl >/dev/null 2>&1 || true

    echo "✅ Production Apache configuration active"
else
    echo "⚙️ Using development Apache configuration"
fi

# Note: Apache will need a graceful restart after PHP-FPM starts to fully load subdomain configs

# Ensure preload.php exists to prevent OPcache errors (especially in production)
if [ ! -f /var/www/html/infrastructure/config/preload.php ]; then
    echo "⚠️ preload.php missing, creating dynamic stub..."
    echo "<?php // dynamic preload stub - created at runtime ?>" > /var/www/html/infrastructure/config/preload.php
fi

# Dynamic PHP configuration based on APP_ENV
if [ "${APP_ENV}" = "production" ]; then
    echo "⚙️ Applying production PHP configuration";
    # Copy production-optimized php.ini if it exists
    if [ -f /var/www/html/infrastructure/docker/php/php-production.ini ]; then
        cp /var/www/html/infrastructure/docker/php/php-production.ini /usr/local/etc/php/conf.d/custom-php.ini
        echo "✅ Production PHP configuration loaded"
    else
        echo "⚠️ Production php.ini not found, using development config"
    fi

    # Additional production-specific overrides
    cat > /usr/local/etc/php/conf.d/zz-env-overrides.ini <<'EOF'
; Runtime generated (production)
opcache.validate_timestamps=0
opcache.revalidate_freq=0
opcache.preload=/var/www/html/infrastructure/config/preload.php
opcache.preload_user=www-data
opcache.save_comments=1
opcache.max_wasted_percentage=5
EOF
else
    echo "⚙️ Using development PHP configuration";
    # Development config is already copied during build
    # Additional development-specific overrides
    cat > /usr/local/etc/php/conf.d/zz-env-overrides.ini <<'EOF'
; Runtime generated (development)
opcache.validate_timestamps=1
opcache.revalidate_freq=1
opcache.max_wasted_percentage=15
EOF
fi

if [ ! -f /var/www/html/infrastructure/config/preload.php ]; then
    echo "<?php // dynamic preload stub ?>" > /var/www/html/infrastructure/config/preload.php
fi

php -i | grep -E 'opcache.jit_buffer_size|opcache.jit=|validate_timestamps|revalidate_freq' || true

echo "🚀 Starting PHP-FPM..."
# Start PHP-FPM in the background
php-fpm -D

# Wait a moment for PHP-FPM to start
sleep 2

# Verify PHP-FPM is running
if ! ps aux | grep -q "[p]hp-fpm: master"; then
    echo "❌ PHP-FPM failed to start!"
    exit 1
fi

echo "✅ PHP-FPM started successfully"

# Start ownership and permissions watcher inline (for bind-mounted directories)
echo "🔍 Starting ownership and permissions watcher for bind-mounted directories..."
bash -c 'while true; do
    # Fix ownership for files
    find /var/www/html/modules -type f ! -user ${HOST_UID:-1000} -exec chown ${HOST_UID:-1000}:${HOST_GID:-1000} {} + 2>/dev/null || true
    find /var/www/html/common -type f ! -user ${HOST_UID:-1000} -exec chown ${HOST_UID:-1000}:${HOST_GID:-1000} {} + 2>/dev/null || true
    find /var/www/html/public -type f ! -user ${HOST_UID:-1000} -exec chown ${HOST_UID:-1000}:${HOST_GID:-1000} {} + 2>/dev/null || true

    # Fix ownership and permissions for directories (ensure group write)
    find /var/www/html/modules -type d ! -user ${HOST_UID:-1000} -exec chown ${HOST_UID:-1000}:${HOST_GID:-1000} {} + 2>/dev/null || true
    find /var/www/html/common -type d ! -user ${HOST_UID:-1000} -exec chown ${HOST_UID:-1000}:${HOST_GID:-1000} {} + 2>/dev/null || true
    find /var/www/html/public -type d ! -user ${HOST_UID:-1000} -exec chown ${HOST_UID:-1000}:${HOST_GID:-1000} {} + 2>/dev/null || true

    # Ensure all directories have group write permission (775)
    find /var/www/html/modules -type d ! -perm -g=w -exec chmod g+w {} + 2>/dev/null || true
    find /var/www/html/common -type d ! -perm -g=w -exec chmod g+w {} + 2>/dev/null || true
    find /var/www/html/public -type d ! -perm -g=w -exec chmod g+w {} + 2>/dev/null || true

    sleep 3
done' &

echo "🚀 Starting Apache with Event MPM and HTTP/2..."

# Set Apache runtime directory to a writable location
# Directories are already created with proper permissions in Dockerfile
export APACHE_RUN_DIR=/tmp/apache2-runtime
export APACHE_PID_FILE=$APACHE_RUN_DIR/apache2.pid
export APACHE_LOCK_DIR=/tmp/apache2-locks

# Start Apache in foreground (this keeps the container running)
exec /usr/sbin/apache2ctl -D FOREGROUND
