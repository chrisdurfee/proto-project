ARG PHP_VERSION=8.4
FROM php:${PHP_VERSION}-fpm

# Install system dependencies including Apache2
RUN apt-get update && apt-get install -y \
    apache2 \
    apache2-utils \
    libapache2-mod-fcgid \
    zip \
    unzip \
    curl \
    git \
    netcat-traditional \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    brotli \
    supervisor \
    inotify-tools \
    && apt-get install -y libapache2-mod-brotli || echo "Brotli module not available" \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    mysqli \
    pdo_mysql \
    zip \
    gd \
    mbstring \
    xml \
    intl \
    opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Copy module enablement script
COPY infrastructure/docker/enable-modules.sh /tmp/enable-modules.sh
COPY infrastructure/docker/check-modules.sh /usr/local/bin/check-modules.sh
COPY infrastructure/docker/verify-build.sh /tmp/verify-build.sh
RUN chmod +x /tmp/enable-modules.sh && /tmp/enable-modules.sh && rm /tmp/enable-modules.sh \
    && chmod +x /usr/local/bin/check-modules.sh \
    && chmod +x /tmp/verify-build.sh

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin \
    --filename=composer

# Copy custom PHP configuration
COPY infrastructure/docker/php/php.ini /usr/local/etc/php/conf.d/custom-php.ini

# Copy Apache configurations and entrypoint
COPY infrastructure/docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY infrastructure/docker/apache-production.conf /etc/apache2/sites-available/001-production.conf
COPY infrastructure/docker/apache-subdomain.conf /etc/apache2/sites-available/002-subdomain.conf
COPY infrastructure/docker/apache-subdomain-ssl.conf /etc/apache2/sites-available/003-subdomain-ssl.conf
COPY infrastructure/docker/apache-ssl-vhost.conf /etc/apache2/sites-available/default-ssl.conf
COPY infrastructure/docker/performance.conf /etc/apache2/conf-available/performance.conf
COPY infrastructure/docker/apache-mpm-event.conf /etc/apache2/conf-available/mpm-event.conf
COPY infrastructure/docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Copy PHP-FPM configurations
COPY infrastructure/docker/php/php-fpm.conf /usr/local/etc/php-fpm.conf
COPY infrastructure/docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Generate self-signed SSL certificate for local development
RUN mkdir -p /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/localhost.key \
    -out /etc/ssl/certs/localhost.crt \
    -subj "/C=US/ST=Development/L=Local/O=Proto/OU=Development/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1" && \
    chmod 600 /etc/ssl/private/localhost.key

# Disable prefork MPM and enable event MPM for HTTP/2 support
RUN a2dismod mpm_prefork && \
    a2dismod php* || true && \
    a2enmod mpm_event && \
    a2enmod proxy && \
    a2enmod proxy_fcgi && \
    a2enmod ssl && \
    a2enmod http2 && \
    a2enmod socache_shmcb && \
    a2enmod rewrite && \
    a2enmod headers && \
    a2enmod expires && \
    a2enmod deflate && \
    a2ensite default-ssl && \
    a2enconf performance && \
    a2enconf mpm-event && \
    chmod +x /usr/local/bin/entrypoint.sh

# Configure Apache to use Event MPM and proxy to PHP-FPM
RUN echo "SetEnvIf Authorization \"(.*)\" HTTP_AUTHORIZATION=\$1" >> /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better layer caching
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-scripts --no-autoloader --no-dev --prefer-dist

# Copy essential infrastructure files that are needed for auto-migration
COPY infrastructure/ ./infrastructure/

# Copy sync-config.js if it exists (needed for configuration)
COPY sync-config.js* ./

# COPY application directories - these will be used if bind mounts fail
COPY common/ ./common/
COPY modules/ ./modules/
COPY public/ ./public/

# Install Node.js for building frontend apps
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy frontend apps
COPY apps/ ./apps/

# Build frontend apps for production (main and crm only, developer is dev-only)
RUN cd apps/main && npm install && npm run build && \
    cd ../crm && npm install && npm run build && \
    cd ../.. && \
    echo "Frontend apps built successfully"

# Create placeholder for preload.php to prevent OPcache errors
RUN mkdir -p /var/www/html/common/Migrations \
    && mkdir -p /var/www/html/infrastructure/config \
    && echo "<?php // Placeholder for bind mount - will be replaced at runtime ?>" > /var/www/html/infrastructure/config/preload.php

# Generate autoloader with available files - will be regenerated by entrypoint when bind mounts are active
RUN composer dump-autoload --optimize --no-dev || echo "Autoloader generation skipped - will regenerate at runtime"

# Set ownership for www-data (bind mounts will override content but keep permissions)
RUN chown -R www-data:www-data /var/www/html

# Expose ports 80 (HTTP) and 443 (HTTPS)
EXPOSE 80 443

# Use custom entrypoint for initialization
CMD ["/usr/local/bin/entrypoint.sh"]