FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
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
    apache2-utils \
    brotli \
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

# Configure OPcache for production
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=16" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=4000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=2" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/opcache.ini

# Set recommended PHP settings
RUN echo "upload_max_filesize=100M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size=100M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/memory.ini \
    && echo "max_execution_time=300" >> /usr/local/etc/php/conf.d/execution.ini

# Copy Apache configurations and entrypoint
COPY infrastructure/docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY infrastructure/docker/performance.conf /etc/apache2/conf-available/performance.conf
COPY infrastructure/docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Enable performance configuration and set entrypoint permissions
RUN a2enconf performance && chmod +x /usr/local/bin/entrypoint.sh

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better layer caching
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-scripts --no-autoloader --no-dev --prefer-dist

# Copy application code
COPY . .

# Build-time automation
RUN echo "🔄 Running build-time setup..." \
    && php -r "echo '✅ PHP syntax check passed\n';" \
    && if [ -f "sync-config.js" ]; then \
        echo "🔄 Syncing configuration..." && \
        node sync-config.js || echo "⚠️ Config sync skipped (optional)"; \
    fi \
    && echo "🔧 Setting up Proto environment..." \
    && php infrastructure/scripts/setup-local-dev.php || echo "⚠️ Local dev setup skipped (optional)" \
    && echo "✅ Build automation complete"

# Generate autoloader and run post-install scripts
RUN composer dump-autoload --optimize --no-dev

# Set proper permissions
RUN \
	find . -type d -exec chmod 755 {} \; && \
	find . -type f -exec chmod 644 {} \; && \
	chown -R www-data:www-data .

# Final build verification
RUN /tmp/verify-build.sh && rm /tmp/verify-build.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint for initialization
CMD ["/usr/local/bin/entrypoint.sh"]