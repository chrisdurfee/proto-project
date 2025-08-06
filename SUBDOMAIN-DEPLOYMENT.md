# Subdomain Deployment Guide

This guide explains how to deploy the Proto Project using subdomains for each application.

## Subdomain Structure

| Subdomain | Purpose | Serves From |
|-----------|---------|-------------|
| `api.domain.com` | Backend API | `public/api/` |
| `app.domain.com` | Main Application | `public/main/` |
| `crm.domain.com` | CRM Interface | `public/crm/` |
| `dev.domain.com` | Developer Tools | `public/developer/` |

## Building for Production

### 1. Build All Apps

**Linux/macOS:**
```bash
chmod +x build-production.sh
./build-production.sh
```

**Windows:**
```cmd
build-production.bat
```

This creates production builds in:
- `public/main/` → Main app
- `public/crm/` → CRM app
- `public/developer/` → Developer app
- `public/api/` → Backend API

### 2. DNS Configuration

Create A records pointing to your server:

```dns
api.domain.com    IN  A  YOUR_SERVER_IP
app.domain.com    IN  A  YOUR_SERVER_IP
crm.domain.com    IN  A  YOUR_SERVER_IP
dev.domain.com    IN  A  YOUR_SERVER_IP
```

### 3. Web Server Configuration

#### Apache

Use the provided configuration:

```bash
# Copy Apache configuration
cp docker/apache-subdomain.conf /etc/apache2/sites-available/subdomains.conf

# Enable the site
a2ensite subdomains.conf

# Enable required modules
a2enmod rewrite
a2enmod headers
a2enmod ssl

# Restart Apache
systemctl restart apache2
```

#### Nginx Alternative

```nginx
# API Subdomain
server {
    listen 80;
    server_name api.domain.com;
    root /var/www/html/public;
    index index.php;

    location /api/ {
        try_files $uri $uri/ /api/index.php?$query_string;

        # CORS headers
        add_header Access-Control-Allow-Origin "https://app.domain.com, https://crm.domain.com, https://dev.domain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, CSRF-TOKEN, X-Requested-With" always;
    }

    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}

# Main App Subdomain
server {
    listen 80;
    server_name app.domain.com;
    root /var/www/html/public/main;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# CRM App Subdomain
server {
    listen 80;
    server_name crm.domain.com;
    root /var/www/html/public/crm;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Developer App Subdomain
server {
    listen 80;
    server_name dev.domain.com;
    root /var/www/html/public/developer;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. SSL Configuration

For production, add SSL certificates:

```bash
# Using Let's Encrypt (Certbot)
certbot --apache -d api.domain.com -d app.domain.com -d crm.domain.com -d dev.domain.com
```

### 5. Backend CORS Update

Update `public/api/index.php` for production CORS:

```php
<?php declare(strict_types=1);

// Production CORS headers for subdomains
header("Access-Control-Allow-Origin: https://app.domain.com, https://crm.domain.com, https://dev.domain.com");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, CSRF-TOKEN, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/../../vendor/autoload.php';
Proto\Api\ApiRouter::initialize();
```

## Testing Deployment

After deployment, test each subdomain:

```bash
# Test API
curl https://api.domain.com/api/auth/csrf-token

# Test Main App
curl -I https://app.domain.com/

# Test CRM App
curl -I https://crm.domain.com/

# Test Developer App
curl -I https://dev.domain.com/
```

## Troubleshooting

### Common Issues

**CORS Errors:**
- Verify backend CORS headers include all frontend subdomains
- Check that API subdomain is accessible from frontend apps

**404 Errors on SPA Routes:**
- Ensure Apache/Nginx rewrite rules are configured
- Verify `index.html` fallback is working

**Build Issues:**
- Run builds with `NODE_ENV=production`
- Clear any existing build directories before building

**DNS Issues:**
- Verify A records are pointing to correct IP
- Check DNS propagation with `dig` or online tools

### File Permissions

Ensure web server has proper permissions:

```bash
chown -R www-data:www-data /var/www/html/public/
chmod -R 755 /var/www/html/public/
```

## Benefits of Subdomain Architecture

✅ **Clean URLs**: Each app has its own domain
✅ **Independent Scaling**: Scale apps separately
✅ **Better SEO**: Each app can have its own meta tags
✅ **Security**: Easier to implement app-specific security rules
✅ **Analytics**: Track each app separately
✅ **CDN**: Use different CDN strategies per app
