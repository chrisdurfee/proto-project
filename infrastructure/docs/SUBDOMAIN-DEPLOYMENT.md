# Subdomain Deployment Guide

This guide explains how to deploy the Proto Project using subdomains for each application.

## Domain Configuration

The project uses a **hybrid dom### 4. SSL Certificate Setup

For production deployment with HTTPS, you have several options:

#### Option A: Let's Encrypt (Recommended - Free SSL)

**Automated Setup:**
```bash
# Linux/macOS
chmod +x setup-ssl.sh
./setup-ssl.sh yourdomain.com your-email@yourdomain.com

# Windows
setup-ssl.bat yourdomain.com your-email@yourdomain.com
```

**Manual Let's Encrypt Setup:**
```bash
# Install Certbot
sudo apt install certbot

# Get certificates for all subdomains
sudo certbot certonly --webroot -w /var/www/html/public \
  -d api.yourdomain.com \
  -d app.yourdomain.com \
  -d crm.yourdomain.com \
  -d dev.yourdomain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Option B: Using Production Docker Compose

Use the production docker-compose file with SSL support:

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your settings
nano .env

# Start with SSL support
```bash
docker-compose -f infrastructure/docker-compose.production.yaml up -d
```
```

**Required .env variables:**
```bash
DOMAIN_NAME=yourdomain.com
DB_ROOT_PASSWORD=your_secure_password
DB_DATABASE=proto
DB_USERNAME=proto_user
DB_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password
```

#### Option C: Custom SSL Certificates

If you have your own SSL certificates:

1. **Place certificates in the correct locations:**
   ```bash
   # Create directories
   mkdir -p certs private

   # Copy your certificates
   cp your-certificate.crt certs/yourdomain.com.crt
   cp your-private-key.key private/yourdomain.com.key

   # Set permissions
   chmod 644 certs/yourdomain.com.crt
   chmod 600 private/yourdomain.com.key
   ```

2. **Update docker-compose.production.yaml** to mount your certificates:
   ```yaml
   web:
     volumes:
       - ./certs:/etc/ssl/certs/custom
       - ./private:/etc/ssl/private/custom
     environment:
       - DOMAIN_NAME=yourdomain.com
   ```

#### Option D: Traefik Reverse Proxy (Advanced)

For automatic SSL management and load balancing:

```bash
# Use Traefik setup
docker-compose -f docker-compose.traefik.yaml up -d

# Traefik will automatically:
# - Request Let's Encrypt certificates
# - Handle SSL termination
# - Route traffic to containers
# - Renew certificates automatically
```iguration system** that automatically reads settings from your Proto framework configuration.

### Setting Your Domain

**Option 1: Configure via Proto .env (Recommended)**

Edit `common/Config/.env` and update the domain section:

```json
{
  "domain": {
    "production": "yourdomain.com",
    "development": "localhost",
    "subdomains": {
      "api": "api",
      "main": "app",
      "crm": "crm",
      "developer": "dev"
    },
    "ssl": true,
    "ports": {
      "development": {
        "api": 8080,
        "main": 3000,
        "crm": 3001,
        "developer": 3002
      }
    }
  }
}
```

**Option 2: Configure via domain.config.js (Fallback)**

If the Proto config can't be read, the system uses defaults from `domain.config.js`:

```javascript
const DEFAULT_CONFIG = {
    production: 'yourdomain.com',
    development: 'localhost',
    // ... other settings
};
```

### How It Works

- **Development**: Uses localhost with ports (3000, 3001, 3002, 8080)
- **Production**: Uses subdomains with your configured domain
- **Automatic**: All Vite configs and build scripts read from this central configuration

## Subdomain Structure

Based on your domain configuration, the structure will be:

| Subdomain | Purpose | Serves From |
|-----------|---------|-------------|
| `api.yourdomain.com` | Backend API | `public/api/` |
| `app.yourdomain.com` | Main Application | `public/main/` |
| `crm.yourdomain.com` | CRM Interface | `public/crm/` |
| `dev.yourdomain.com` | Developer Tools | `public/developer/` |

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

Create A records pointing to your server (replace `yourdomain.com` with your actual domain):

```dns
api.yourdomain.com    IN  A  YOUR_SERVER_IP
app.yourdomain.com    IN  A  YOUR_SERVER_IP
crm.yourdomain.com    IN  A  YOUR_SERVER_IP
dev.yourdomain.com    IN  A  YOUR_SERVER_IP
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
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
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
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
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
