# Production Deployment Guide

This guide covers building and deploying the Proto Project production Docker container with frontend apps baked in.

---

## 🐳 Production Container Overview

The production setup uses a **standalone Docker image** that includes:
- ✅ PHP 8.4-FPM with production optimizations
- ✅ Apache 2.4 with Event MPM + HTTP/2 support
- ✅ Built frontend apps (Main & CRM) included in the image
- ✅ Subdomain routing for clean URLs
- ✅ HTTPS with self-signed certificates (for local testing)
- ✅ MariaDB 10.6 + Redis 7

**Key Feature**: Frontend apps are **built during Docker image creation**, making the container truly portable and production-ready.

---

## 📋 Prerequisites

- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Docker Compose v2+
- 4GB+ RAM available for containers
- Ports 80, 443, 3307, 6380 available on host

---

## 🚀 Quick Start

### Build Production Image

```bash
# Build the production image (includes frontend builds)
docker-compose -f infrastructure/docker-compose.production.yaml build web

# Or build from scratch (recommended after code changes)
docker-compose -f infrastructure/docker-compose.production.yaml build --no-cache web
```

### Start Production Environment

```bash
# Start all services (web, mariadb, redis)
docker-compose -f infrastructure/docker-compose.production.yaml up -d

# Check status
docker-compose -f infrastructure/docker-compose.production.yaml ps

# View logs
docker-compose -f infrastructure/docker-compose.production.yaml logs -f web
```

### Stop Production Environment

```bash
# Stop all containers
docker-compose -f infrastructure/docker-compose.production.yaml down

# Stop and remove volumes (WARNING: deletes database)
docker-compose -f infrastructure/docker-compose.production.yaml down -v
```

---

## 🔧 Build Process Details

### What Happens During Build

When you run `docker-compose -f infrastructure/docker-compose.production.yaml build web`:

1. **Base Image**: PHP 8.4-FPM from official Docker image
2. **System Packages**: Apache, Node.js 18, build tools
3. **PHP Extensions**: opcache, redis, gd, mysqli, pdo_mysql, zip
4. **Apache Configuration**:
   - Event MPM (high performance)
   - HTTP/2 enabled
   - Subdomain routing configured
   - Self-signed SSL certificates generated
5. **PHP Dependencies**: `composer install --no-dev --optimize-autoloader`
6. **Frontend Build**:
   - Main app: `apps/main` → `public/main/`
   - CRM app: `apps/crm` → `public/crm/`
   - Vite builds with correct base paths (`/main/`, `/crm/`)
7. **File Permissions**: All files owned by `www-data`

**Build Time**: ~3-5 minutes (first build), ~30-60 seconds (cached builds)

**Image Size**: ~2.2 GB

---

## 🌐 Accessing Your Apps

### Local Testing

Add these entries to your `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 main.localhost
127.0.0.1 crm.localhost
127.0.0.1 api.localhost
```

### Available URLs

| App | HTTP | HTTPS |
|-----|------|-------|
| **Main App** | http://main.localhost | https://main.localhost |
| **CRM App** | http://crm.localhost | https://crm.localhost |
| **API** | http://api.localhost/api | https://api.localhost/api |
| **Direct Path (Main)** | http://localhost/main/ | https://localhost/main/ |
| **Direct Path (CRM)** | http://localhost/crm/ | https://localhost/crm/ |

### Testing

```bash
# Test HTTP routing
curl -s http://main.localhost | grep '<title>'
curl -s http://crm.localhost | grep '<title>'

# Test HTTPS (with self-signed cert)
curl -sk https://main.localhost | grep '<title>'

# Test HTTP/2 support
curl -skI --http2 https://main.localhost | head -1

# Test asset loading
curl -I http://localhost/main/assets/index-*.js
```

---

## 📁 Container Structure

### Volume Mounts

The production setup uses **minimal volume mounts** for maximum portability:

```yaml
volumes:
  # Writable directories only
  - ./public/files:/var/www/html/public/files:rw
  - ./common/files:/var/www/html/common/files:rw

  # Configuration files
  - ./infrastructure/docker/php/php.ini:/usr/local/etc/php/conf.d/custom.ini:ro
  - ./infrastructure/docker/apache-mpm.conf:/etc/apache2/conf-available/mpm-tuning.conf:ro
```

**No code bind mounts** = The application code is baked into the image for consistency.

### Inside the Container

```
/var/www/html/
├── public/
│   ├── main/           # Built Main app (from apps/main)
│   │   ├── index.html
│   │   ├── assets/     # JS, CSS, images
│   │   └── ...
│   ├── crm/            # Built CRM app (from apps/crm)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── api/            # Backend API
│   └── files/          # Uploaded files (mounted)
├── modules/            # PHP modules
├── common/             # Shared code
├── vendor/             # Composer packages
└── ...
```

---

## 🔐 Environment Configuration

### Production Environment Variables

Located in `infrastructure/docker-compose.production.yaml`:

```yaml
environment:
  APP_ENV: production
  ENVIRONMENT: production
  AUTO_MIGRATE: "true"          # Auto-run migrations on startup

  # Database
  DB_HOST: mariadb
  DB_PORT: 3306
  DB_NAME: proto
  DB_USER: proto_app_user
  DB_PASS: secure_password_here  # Change in production!

  # Redis
  REDIS_HOST: redis
  REDIS_PORT: 6379
  REDIS_PASSWORD: redis_password_here  # Change in production!
```

**Security Note**: Change default passwords before deploying to production!

---

## ⚙️ Configuration Files

### Frontend Vite Configuration

The apps must be configured with the correct base path for subdirectory serving:

**`apps/main/vite.config.js`**:
```javascript
export default defineConfig({
  base: '/main/',  // Important: Must match subdirectory
  build: {
    outDir: path.resolve(__dirname, '../../public/main'),
  }
});
```

**`apps/crm/vite.config.js`**:
```javascript
export default defineConfig({
  base: '/crm/',   // Important: Must match subdirectory
  build: {
    outDir: path.resolve(__dirname, '../../public/crm'),
  }
});
```

### Apache Subdomain Configuration

Subdomain routing is configured in:
- `infrastructure/docker/apache-subdomain.conf` (HTTP)
- `infrastructure/docker/apache-subdomain-ssl.conf` (HTTPS)

These files handle:
- Subdomain-to-directory mapping
- SPA client-side routing fallbacks
- API proxying to PHP-FPM
- Static asset caching

---

## 🔄 Updating Production

### After Code Changes

```bash
# 1. Rebuild the image
docker-compose -f infrastructure/docker-compose.production.yaml build web

# 2. Recreate containers
docker-compose -f infrastructure/docker-compose.production.yaml up -d --force-recreate web
```

### After Configuration Changes

```bash
# Rebuild with no cache to ensure changes are picked up
docker-compose -f infrastructure/docker-compose.production.yaml build --no-cache web
docker-compose -f infrastructure/docker-compose.production.yaml up -d --force-recreate
```

### Database Migrations

Migrations run automatically on container startup when `AUTO_MIGRATE=true`.

To run manually:
```bash
docker-compose -f infrastructure/docker-compose.production.yaml exec web php infrastructure/scripts/run-migrations.php
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f infrastructure/docker-compose.production.yaml logs web

# Common issues:
# - Port conflicts (80, 443 already in use)
# - Database connection timeout
# - Missing environment variables
```

### Assets Not Loading (404s)

**Symptoms**: JavaScript/CSS files return 404, apps show blank page

**Solution**: Ensure Vite `base` path is correct in config files:
```bash
# Check current base paths
grep -r "base:" apps/*/vite.config.js

# Should show:
# apps/main/vite.config.js: base: '/main/',
# apps/crm/vite.config.js: base: '/crm/',
```

If incorrect, update the config files and rebuild the image.

### Subdomain Routing Not Working

```bash
# 1. Verify /etc/hosts entries
cat /etc/hosts | grep localhost

# 2. Check Apache vhost configuration
docker-compose -f infrastructure/docker-compose.production.yaml exec web apache2ctl -S

# 3. Verify subdomain configs are enabled
docker-compose -f infrastructure/docker-compose.production.yaml exec web ls -la /etc/apache2/sites-enabled/
```

### Host Apache Interfering

If you have Apache running on your host machine, it may intercept requests:

```bash
# Stop host Apache (Ubuntu/Debian)
sudo systemctl stop apache2
sudo systemctl disable apache2

# Then restart containers
docker-compose -f infrastructure/docker-compose.production.yaml restart web
```

### Database Connection Issues

```bash
# Check MariaDB is running
docker-compose -f infrastructure/docker-compose.production.yaml ps mariadb

# Check logs
docker-compose -f infrastructure/docker-compose.production.yaml logs mariadb

# Connect to database
docker-compose -f infrastructure/docker-compose.production.yaml exec mariadb mysql -u proto_app_user -p proto
```

---

## 📊 Performance Optimization

### Production PHP Settings

The container automatically applies production optimizations:

```ini
# OPcache
opcache.enable=1
opcache.jit_buffer_size=128M
opcache.validate_timestamps=0  # Don't check for file changes
opcache.revalidate_freq=0

# PHP-FPM
pm = dynamic
pm.max_children = 20
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 10
```

### Apache Event MPM

High-performance multi-processing module configured:

```apache
StartServers             25
MinSpareThreads          75
MaxSpareThreads         250
ThreadsPerChild          25
MaxRequestWorkers       400
MaxConnectionsPerChild   0
```

### Resource Limits

Configured in `infrastructure/docker-compose.production.yaml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 1G
    reservations:
      cpus: '0.25'
      memory: 512M
```

Adjust based on your server's capacity.

---

## 🔒 Security Considerations

### For Local Testing

- Self-signed SSL certificates are included for HTTPS testing
- Default passwords are used for simplicity

### Before Production Deployment

1. **Change all passwords**:
   - Database passwords in `infrastructure/docker-compose.production.yaml`
   - Redis password
   - Any API keys in configuration

2. **Use real SSL certificates**:
   - Replace self-signed certs with Let's Encrypt or commercial certs
   - Update certificate paths in Apache SSL config

3. **Configure firewall**:
   - Restrict database ports (3306, 6379) to internal network only
   - Only expose 80 and 443 publicly

4. **Enable additional security headers**:
   - Content Security Policy (CSP)
   - HSTS with longer max-age
   - X-Frame-Options, X-Content-Type-Options

5. **Review file permissions**:
   - Ensure `public/files` and `common/files` have appropriate permissions
   - Disable directory listing in Apache

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Proto Framework](https://github.com/protoframework/proto)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [Apache HTTP/2 Guide](https://httpd.apache.org/docs/2.4/howto/http2.html)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review container logs: `docker-compose -f infrastructure/docker-compose.production.yaml logs -f`
3. Verify container health: `docker-compose -f infrastructure/docker-compose.production.yaml ps`
4. Check GitHub issues or create a new one

---

## 📝 Quick Reference

### Essential Commands

```bash
# Build
docker-compose -f infrastructure/docker-compose.production.yaml build web
docker-compose -f infrastructure/docker-compose.production.yaml build --no-cache web

# Start/Stop
docker-compose -f infrastructure/docker-compose.production.yaml up -d
docker-compose -f infrastructure/docker-compose.production.yaml down

# Logs & Status
docker-compose -f infrastructure/docker-compose.production.yaml logs -f web
docker-compose -f infrastructure/docker-compose.production.yaml ps

# Execute Commands
docker-compose -f infrastructure/docker-compose.production.yaml exec web bash
docker-compose -f infrastructure/docker-compose.production.yaml exec web php artisan migrate

# Cleanup
docker-compose -f infrastructure/docker-compose.production.yaml down -v
docker system prune -a
```

### File Locations

| Item | Path |
|------|------|
| Production Compose | `infrastructure/docker-compose.production.yaml` |
| infrastructure/docker/Dockerfile | `infrastructure/docker/Dockerfile` |
| Apache HTTP Config | `infrastructure/docker/apache-subdomain.conf` |
| Apache HTTPS Config | `infrastructure/docker/apache-subdomain-ssl.conf` |
| Entrypoint Script | `infrastructure/docker/entrypoint.sh` |
| PHP-FPM Config | `infrastructure/docker/php/www.conf` |
| Main App Vite Config | `apps/main/vite.config.js` |
| CRM App Vite Config | `apps/crm/vite.config.js` |

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Containers are running and healthy
- [ ] Main app loads at http://main.localhost
- [ ] CRM app loads at http://crm.localhost
- [ ] HTTPS works (https://main.localhost)
- [ ] HTTP/2 is enabled
- [ ] Assets load correctly (no 404s in browser console)
- [ ] API endpoints respond
- [ ] Database connection works
- [ ] Redis connection works

Quick test command:
```bash
curl -s http://main.localhost | grep '<title>' && \
curl -sk https://main.localhost | grep '<title>' && \
curl -skI --http2 https://main.localhost | head -1 && \
echo "✅ All tests passed!"
```

---

**Last Updated**: October 2025
**Version**: 1.0
