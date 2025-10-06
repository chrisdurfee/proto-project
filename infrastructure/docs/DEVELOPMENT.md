# Development Setup

## Overview

This project uses a **hybrid containerized development approach** with **automated setup** and **centralized domain configuration**:

- **Backend Services**: Run in Docker containers (PHP, MariaDB, Redis) with automatic initialization
- **Frontend Apps**: Run locally with Vite dev servers for fast hot module reload
- **Domain Config**: Centralized system that reads from Proto `.env` configuration
- **Auto-Migration**: Database schema automatically stays up-to-date

## ✨ What's Automated

The Docker setup now includes intelligent automation to minimize setup time:

### **Automatic on Container Start:**
- ✅ **Database Migrations**: Runs automatically (configurable via `AUTO_MIGRATE` env var)
- ✅ **Service Dependencies**: Waits for database/Redis to be ready
- ✅ **Configuration Sync**: Reads from Proto config during build
- ✅ **Health Checks**: Verifies autoloader and dependencies

### **Manual Operations:**
- ❌ **SSL Certificates**: Intentionally manual for security
- ❌ **Production Deployment**: Requires explicit commands

## Domain Configuration

The project automatically configures URLs based on your environment. All apps read from a central configuration.

**Development URLs** (automatically configured):
- Backend API: `http://localhost:8080`
- Main App: `http://localhost:3000`
- CRM App: `http://localhost:3001`
- Developer Tools: `http://localhost:3002`

**Production URLs** (configured in `common/Config/.env`):
- Backend API: `https://api.yourdomain.com`
- Main App: `https://app.yourdomain.com`
- CRM App: `https://crm.yourdomain.com`
- Developer Tools: `https://dev.yourdomain.com`

### Changing Your Domain

To configure your actual domain, edit `common/Config/.env`:

```json
{
  "domain": {
    "production": "yourdomain.com", // ← Change this
    "development": "localhost",
    "subdomains": {
      "api": "api",
      "main": "app",
      "crm": "crm",
      "developer": "dev"
    },
    "ssl": true
  }
}
```

All apps will automatically use the new domain settings without code changes.

### Configuration Sync

The project uses a **single source of truth** for configuration:

**Primary Config**: `common/Config/.env` (Proto framework configuration)
**Generated Config**: `.env` (Docker environment variables)

**To update any database, Redis, email, or domain settings:**

1. **Edit Proto config**: Update `common/Config/.env`
2. **Sync to Docker**: Run `node sync-config.js`
3. **Restart containers**: Run `docker-compose restart`

This ensures you only maintain configuration in one place, eliminating sync issues between Proto and Docker configurations.

**Configuration Sync Details:**
- **Database**: Maps from `connections.default.dev/prod`
- **Redis**: Maps from `cache.connection`
- **Email**: Maps from `email.smtp` settings
- **Domain**: Maps from `domain` configuration
- **App Environment**: Maps from `env` (dev → development)

## Email Configuration

The system now uses PHPMailer with SMTP for universal email sending across all environments. This provides better reliability and consistency between development and production.

### Environment Variables

You can configure email settings in two ways:

**Option 1: Proto Configuration (Recommended)**
Edit `common/Config/.env` and sync to Docker:

```json
{
  "email": {
    "smtp": {
      "host": "smtp.mailtrap.io",
      "port": 2525,
      "username": "your_username",
      "password": "your_password",
      "encryption": "tls",
      "fromAddress": "noreply@proto-project.com",
      "fromName": "Proto Project",
      "sendingEnabled": false
    }
  }
}
```

Then run: `node sync-config.js`

**Option 2: Direct Docker Configuration**
Edit the root `.env` file directly:

```bash
# Email Configuration (Universal SMTP)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@proto-project.com
MAIL_FROM_NAME="Proto Project"
# Set to 'true' to enable email sending in development (disabled by default)
MAIL_SENDING_ENABLED=false
```

### Development Email Control

By default, email sending is **disabled** in development environments to prevent accidental sending. You can:

1. **Enable for testing**: Set `MAIL_SENDING_ENABLED=true` in your `.env` file
2. **Control at runtime**: Use the dispatcher's gate functionality

```php
// Example: Enable email sending for specific tests
$email = new \Proto\Dispatch\Email($to, 'html', $from, $subject, $message);
$email->setSendingEnabled(true);
$result = $email->send();
```

### SMTP Providers

The system works with any SMTP provider:

- **Development**: Mailtrap, MailHog, or local SMTP
- **Production**: SendGrid, Mailgun, Amazon SES, etc.
- **Corporate**: Office 365, Gmail, custom SMTP servers

### Migration from MailHog

If you were previously using MailHog for email testing, the new system provides the same functionality with these advantages:

- Universal configuration (same setup for dev/prod)
- Better error handling and logging
- Support for advanced SMTP features
- No additional containers required

## Quick Start

### 1. Sync Configuration

First, sync your Proto configuration to Docker:

```bash
# Generate Docker .env from Proto configuration
node sync-config.js

# Or use the helper scripts:
# Windows: sync-config.bat
# Linux/macOS: chmod +x sync-config.sh && ./sync-config.sh
```

### 2. Start Backend Services

```bash
docker-compose up -d
```

> **✨ New**: This now automatically runs database migrations! Watch the logs to see the initialization process:
> ```bash
> docker-compose logs -f web
> ```

This starts and automatically configures:
- **Proto Backend**: `http://localhost:8080` (with auto-migration)
- **MariaDB**: `localhost:3307` (waits until ready)
- **Redis**: `localhost:6380` (waits until ready)
- **phpMyAdmin**: `http://localhost:8081`

### Migration Control

**Default Behavior** (migrations run automatically):
```bash
docker-compose up -d
# → Waits for database
# → Runs pending migrations
# → Starts Apache
```

**Manual Control** (for production or testing):
```bash
# Disable auto-migration
echo "AUTO_MIGRATE=false" >> .env
docker-compose up -d

# Run migrations manually when ready
docker-compose exec web php infrastructure/scripts/run-migrations.php
```

### 2. Start Frontend Apps

Start each app in separate terminals:

```bash
# Main App
cd apps/main
npm run dev
# → http://localhost:3000

# CRM App
cd apps/crm
npm run dev
# → http://localhost:3001

# Developer App
cd apps/developer
npm run dev
# → http://localhost:3002
```

## Benefits

✅ **Fast Hot Module Reload**: Vite runs natively on host machine
✅ **Instant Changes**: File changes reflect immediately in browser
✅ **Clean Architecture**: Backend and frontend properly separated
✅ **Easy API Access**: Frontend apps proxy `/api` requests to containerized backend
✅ **CORS Configured**: Backend allows requests from all three frontend ports
✅ **Auto-Migration**: Database schema stays current without manual intervention
✅ **Intelligent Startup**: Container waits for dependencies and validates setup

## Development Workflow

1. **Backend Changes**: Edit PHP files → Changes reflect immediately (volume mounted)
2. **Frontend Changes**: Edit JS/CSS files → Hot reload updates browser instantly
3. **Database Changes**: Create migrations → Auto-applied on container restart
4. **Database Management**: Use phpMyAdmin at `http://localhost:8081` or direct connection on port 3307
5. **API Testing**: Backend APIs available at `http://localhost:8080/api/*`

### Database Migrations

**Automatic (Default)**:
- Migrations run when container starts
- Perfect for development and team collaboration
- Ensures everyone has the latest schema

**Manual (Production)**:
```bash
# Disable auto-migration
AUTO_MIGRATE=false docker-compose up -d

# Run specific migration
docker-compose exec web php infrastructure/scripts/run-migrations.php --target=2025-01-01
```

## Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│  Frontend (Host)    │    │  Backend (Docker)   │
│                     │    │                     │
│ Main:    :3000 ────────────► PHP:    :8080     │
│ CRM:     :3001 ────────────► MariaDB: :3307     │
│ Dev:     :3002 ────────────► Redis:   :6380     │
│                     │    │ Admin:   :8081     │
└─────────────────────┘    └─────────────────────┘
```

## Troubleshooting

### Backend Issues
- Check containers: `docker ps`
- View logs: `docker logs proto-web`
- Restart: `docker-compose restart`
- Check migrations: `docker-compose logs web | grep Migration`

### Migration Issues
```bash
# Check migration status
docker-compose exec web php infrastructure/scripts/run-migrations.php --status

# Reset and re-run migrations (development only!)
docker-compose exec web php infrastructure/scripts/run-migrations.php --reset

# Disable auto-migration if causing issues
echo "AUTO_MIGRATE=false" >> .env
docker-compose restart web
```

### Frontend Issues
- Check Vite config: `apps/*/vite.config.js`
- Clear cache: `rm -rf apps/*/node_modules/.vite`
- Reinstall: `cd apps/main && npm install`

### Container Startup Issues
```bash
# Watch detailed startup logs
docker-compose up --no-detach

# Check service health
docker-compose exec web bash -c "nc -z mariadb 3306 && echo 'DB OK' || echo 'DB Failed'"
docker-compose exec web bash -c "nc -z redis 6379 && echo 'Redis OK' || echo 'Redis Failed'"
```

### CORS Issues
- Backend CORS configured in the proto router
- Allows: `localhost:3000`, `localhost:3001`, `localhost:3002`

## Production Deployment

When ready to deploy to production with SSL:

### SSL Certificate Setup
```bash
# Linux/macOS
chmod +x setup-ssl.sh
./setup-ssl.sh yourdomain.com your-email@yourdomain.com

# Windows
setup-ssl.bat yourdomain.com your-email@yourdomain.com
```

### Production Docker Compose
```bash
# After SSL setup, use production configuration
```bash
docker-compose -f infrastructure/docker-compose.production.yaml up -d
```
```

This provides:
- ✅ HTTPS/SSL for all subdomains
- ✅ Production-optimized containers
- ✅ Automatic certificate renewal
- ✅ Proper security headers

For detailed production deployment instructions, see [SUBDOMAIN-DEPLOYMENT.md](SUBDOMAIN-DEPLOYMENT.md).

## Previous Containerized Setup

The old setup containerized everything including Vite servers, which caused:
- Slow hot module reload (1+ minute delays)
- Complex volume mounting issues
- Unnecessary containerization overhead

This new approach is faster and simpler for local development.
