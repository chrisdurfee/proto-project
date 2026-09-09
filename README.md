# Proto Project

This repository is a **project skeleton** for building applications on the [Proto Framework](https://github.com/chrisdurfee/proto), with [Base Framework](https://github.com/chrisdurfee/base) on the front end. It includes the files, settings, and configuration you need to bootstrap a large, multi-app platform.

The project is published on Packagist and can be set up in just a few commands. It uses Docker, Composer, NPM, Vite, Base, PHP 8.5+, MariaDB, Redis, and more.

It wires up Docker, a sensible folder structure, and a minimal entry point so you can start writing modules and apps right away. It also includes a companion document to help AI agents understand the project structure, dependencies, and configuration.

The template ships with three front-end apps—**Main (Consumer)**, **CRM (Admin)**, and **Developer**—built with Base + Vite, plus a PHP backend API service. These apps connect to the Proto backend via REST APIs and WebSockets for real-time features.

Each app includes the [Base UI](https://github.com/chrisdurfee/ui) package for pre-built components and styles to speed up development. All apps are **PWAs** with install prompts, support for light/dark mode, and theme customization.

Out of the box, the front end includes working user auth flows: login, password reset, “forgot password,” multi-factor authentication, user activity tracking, session resume, session heartbeat, push-notification support, caching, and more.

The application layer includes a robust user system with roles, permissions, organizations, followers/following, blocking, and more.

On the backend, an integrated **OpenAI** service powers AI features such as chat, completions, embeddings, and other intelligent workflows.

---

## � Prerequisites

### For Containerized Development (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine (Linux or if you are using WSL2)
- Git
- Composer
- Node.js (for frontend development)

### For Traditional Development
- Git
- PHP 8.5+
- Composer
- MySQL/MariaDB
- Node.js (for frontend development)

### Framework Requirements
- **Proto Framework**: v1.0+

---

## �📦 Installation

Choose one of the two approaches:

### 1. Create a brand-new project via Composer (Recommended)

```bash
composer create-project protoframework/proto-project my-app
cd my-app
composer install
```

### 2. Clone & install

```bash
git clone https://github.com/protoframework/proto-project.git my-app
cd my-app
composer install
```

---

## 🐳 Local Development (Hybrid Setup)

This project uses a **hybrid development approach** that combines the best of both worlds:
- **Backend services** run in Docker containers (no local PHP/MySQL needed)
- **Frontend apps** run locally with Vite for lightning-fast hot reload

### Configuration Sync

First, create your Common/Config/.env file by copying the example:

```bash
cp ./common/Config/.env-example ./common/Config/.env
```

Update the environment variables as needed. Then, sync your Proto configuration to Docker:

```bash
# Generate Docker .env from Proto configuration
./infrastructure/scripts/run.sh sync-config

# Or run directly: node infrastructure/scripts/sync-config.js
```

### Quick Start

**1. Start Backend Services:**
```bash
docker compose -f infrastructure/docker-compose.yaml up -d      # Start development
```

> **✨ Automatic Setup**:
> - First run will build the Docker image (may take 2-3 minutes)
> - Dependencies install automatically if `vendor/` is missing
> - Database migrations run automatically (disable with `AUTO_MIGRATE=false`)
> - Bind mounts provide live code editing while keeping container benefits

### 🔐 Trusting the Local Certificate (Remote Development)

**If you are accessing this workspace remotely (e.g., via SSH or a cloud IDE) but viewing the site on your local Windows or Mac computer:**

1. **Download the certificate file:** `infrastructure/docker/ssl/localhost.crt`
2. **Install it on your computer:**
   - **Windows:** Double-click the `.crt` file -> "Install Certificate" -> "Current User" -> "Place all certificates in the following store" -> **"Trusted Root Certification Authorities"**.
   - **Mac:** Double-click the `.crt` file to open Keychain Access. Find the "localhost" cert, double-click it, expand "Trust", and set "When using this certificate" to "Always Trust".
   - **Chrome (Browser Store):** Go to `chrome://certificate-manager`, click "Local certificates", and look for an "Import" option (often under "Custom" or "Your certificates") to add the `.crt` file directly.
3. **Restart Chrome.**

**2. Start Frontend Apps** (in separate terminals):
```bash
# Main App
cd apps/main
npm install  # (first time only)
npm run dev

# CRM App
cd apps/crm
npm install  # (first time only)
npm run dev

# Developer App
cd apps/developer
npm install  # (first time only)
npm run dev
```

### Available Services

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Main App | https://localhost:3000 | Main application (Vite dev server) |
| 🌐 CRM App | https://localhost:3001 | CRM interface (Vite dev server) |
| 🌐 Developer Tools | https://localhost:3002 | Developer UI with scaffolding tools (Vite dev server) |
| 🚀 HTTPS API Server | https://localhost:8443 | PHP backend API (containerized) |
| 🚀 API Server | http://localhost:8080 | PHP backend API (containerized) |
| 🗄️ PHPMyAdmin | http://localhost:8081 | Database management interface |
| 🗄️ Database | localhost:3307 | MariaDB 11.7.2 server |
| 📝 Cache | localhost:6380 | Redis server |

### Development Workflow

**Backend Changes:**
```bash
# View API logs
docker compose -f infrastructure/docker-compose.yaml logs -f web

# Access PHP container
docker compose -f infrastructure/docker-compose.yaml exec web bash

# Restart backend if needed
docker compose -f infrastructure/docker-compose.yaml restart web

# Manual migration control (if AUTO_MIGRATE=false)
docker compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php
```

**Frontend Changes:**
- Edit any `.js`, `.css`, or other frontend files
- Changes appear instantly in browser (hot module reload)
- No need to restart anything!

**Database Management:**
```bash
# Access database directly
docker compose -f infrastructure/docker-compose.yaml exec mariadb mariadb -uroot -proot proto

# Or use phpMyAdmin at http://localhost:8081
```

### Why This Approach?

✅ **Lightning Fast HMR**: Native Vite performance on your host machine
✅ **Instant Updates**: File changes reflect immediately in browser
✅ **Clean Architecture**: Backend and frontend properly separated
✅ **Easy API Access**: Frontend apps automatically proxy `/api` requests to containerized backend
✅ **No Setup Complexity**: No need for local PHP/MySQL installation
✅ **Auto-Migration**: Database schema automatically updates on container start

For detailed setup instructions, see [infrastructure/docs/DEVELOPMENT.md](infrastructure/docs/DEVELOPMENT.md).

---

## 🤖 Automated Features

The Docker setup includes several automation features to streamline development:

### **Build-Time Automation**
When you build the Docker image (`docker-compose -f infrastructure/docker-compose.yaml build`), the following happens automatically:
- ✅ **Configuration Sync**: Reads `common/Config/.env` and generates Docker environment variables
- ✅ **PHP Validation**: Checks PHP syntax across the codebase
- ✅ **Apache Module Setup**: Enables all required modules for `.htaccess` functionality
- ✅ **Build Verification**: Ensures all critical files and directories are present

### **Runtime Automation**
When you start the container (`docker-compose -f infrastructure/docker-compose.yaml up`), the following happens automatically:
- ✅ **Service Dependencies**: Waits for database and Redis to be ready before starting
- ✅ **Database Migrations**: Runs pending migrations automatically (configurable)
- ✅ **Health Checks**: Verifies autoloader and critical dependencies
- ✅ **Apache Startup**: Starts Apache with optimized configuration

### **Migration Control**

By default, database migrations run automatically for convenience:

```bash
# Default behavior - migrations run automatically
docker compose -f infrastructure/docker-compose.yaml up -d
```

For production or when you want manual control:

```bash
# Disable auto-migrations
echo "AUTO_MIGRATE=false" >> .env
docker compose -f infrastructure/docker-compose.yaml up -d

# Then run migrations manually when ready
docker compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php
```

### **SSL Setup (Manual)**

For security reasons, SSL certificate setup remains manual:

```bash
# Set up SSL certificates (production only)
./infrastructure/scripts/run.sh setup-ssl yourdomain.com your-email@yourdomain.com
```

This automation makes the development experience much smoother while maintaining production safety controls.

---

## 🏗️ Directory Layout

```text
proto-project/
├─ apps/                   # Frontend PWAs (main, crm, developer)
├─ common/                 # Shared Proto framework code
├─ modules/                # Proto framework feature modules
├─ public/                 # HTTP entrypoints & public assets
├─ vendor/                 # Composer dependencies
├─ infrastructure/         # Development & deployment infrastructure
│  ├─ config/              # Configuration files
│  │  ├─ domain.config.js  # Domain configuration system
│  │  ├─ docker-compose.production.yaml # Production Docker setup
│  │  └─ docker-compose.traefik.yaml # Traefik reverse proxy
│  ├─ docker/              # Docker-related files
│  │  ├─ apache-subdomain.conf # Apache virtual host config
│  │  ├─ apache-vhost.conf # Standard Apache config
│  │  ├─ Dockerfile        # Docker image definition
│  │  ├─ entrypoint.sh     # Container startup script
│  │  ├─ php/              # PHP configuration
│  │  └─ mysql/            # MySQL initialization scripts
│  ├─ docs/                # Documentation
│  │  ├─ DEVELOPMENT.md    # Development setup guide
│  │  ├─ SSL-SETUP.md      # SSL certificate setup
│  │  ├─ SUBDOMAIN-DEPLOYMENT.md # Production deployment
│  │  └─ ...               # Other documentation
│  ├─ scripts/             # Build and setup scripts
│  │  ├─ build-production.* # Production build scripts
│  │  ├─ setup-ssl.*       # SSL certificate setup
│  │  ├─ sync-config.*     # Configuration sync scripts
│  │  ├─ run.sh / run.bat  # Script runner
│  │  └─ ...               # Other utility scripts
│  ├─ docker-compose.yaml  # Development Docker setup
│  └─ sync-config.js       # Configuration sync utility
└─ README.md               # This file
```

---

## 🚀 Quick Commands

```bash
# Configuration
docker compose -f infrastructure/docker-compose.yaml down         # Stop all services
./infrastructure/scripts/run.sh sync-config              # Sync Proto config to Docker
node infrastructure/scripts/sync-config.js               # Alternative: direct sync

# Development
docker compose -f infrastructure/docker-compose.yaml up -d              # Start backend services (auto-migrates by default)
cd apps/main && npm run dev       # Start main app
cd apps/crm && npm run dev        # Start CRM app
cd apps/developer && npm run dev  # Start developer tools

# Database
AUTO_MIGRATE=false docker compose -f infrastructure/docker-compose.yaml up -d  # Start without auto-migration
./infrastructure/scripts/run.sh migrations               # Run database migrations manually
docker compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php  # Alternative manual migration

# Production
# SSL & Production
./infrastructure/scripts/run.sh setup-ssl yourdomain.com your-email@domain.com  # Setup SSL
./infrastructure/scripts/run.sh build                    # Build all apps for production
docker compose -f infrastructure/config/docker-compose.production.yaml up -d  # Deploy production

# Utilities
./infrastructure/scripts/run.sh help                     # Show all available scripts
docker compose -f infrastructure/docker-compose.yaml logs -f web        # Watch container startup and migration logs
```

### Application Settings

Your application-specific settings live in **`common/Config/.env`**. Proto reads JSON-encoded environment variables from there:

```json
{
  "APP_ENV": "dev",
  "siteName": "My Application",
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
        "api": 8443,
        "main": 3000,
        "crm": 3001,
        "developer": 3002
      }
    }
  }
}
```

### Domain Configuration

The project uses a **hybrid domain configuration system** that automatically adapts URLs based on your environment:

**Development Mode:**
- All apps use `localhost` with specific ports
- No SSL/HTTPS required for local development

**Production Mode:**
- Uses subdomains with your configured domain
- Automatic SSL/HTTPS based on configuration
- All frontend apps automatically use correct API endpoints

**To change your domain:**
1. Edit the `"production"` value in `common/Config/.env`
2. All apps will automatically use the new domain
3. No code changes required in individual apps

The domain configuration is handled by `domain.config.js`, which reads from your Proto configuration and provides fallback defaults if needed.

### SSL Certificate Setup (Production)

For production deployment with HTTPS, use the automated SSL setup:

**Quick SSL Setup:**
```bash
# Linux/macOS
./infrastructure/scripts/run.sh setup-ssl yourdomain.com your-email@yourdomain.com

# Windows
infrastructure\scripts\run.bat setup-ssl yourdomain.com your-email@yourdomain.com
```

This automatically:
- ✅ Requests free Let's Encrypt SSL certificates for all subdomains
- ✅ Sets up certificate renewal scripts
- ✅ Configures Apache for HTTPS
- ✅ Creates production-ready deployment files

**Manual SSL Setup:**
See [infrastructure/docs/SSL-SETUP.md](infrastructure/docs/SSL-SETUP.md) for detailed SSL configuration options including custom certificates and Traefik reverse proxy setup.---

## ⚙️ Configuration

All you need in your front-controller is:

```php
<?php declare(strict_types=1);

// public/api/index.php
require __DIR__ . '/../../vendor/autoload.php';

// Kick off your API router (or any other Proto component)
Proto\Api\ApiRouter::initialize();
```

Behind the scenes Composer’s autoloader handles:

* **`Proto\…`** via the core framework in `vendor/protoframework/proto`
* **`Modules\…`**, **`Common\…`**, and **`Apps\…`** via your local folders

---

## 📦 Creating a New Module

Proto supports both **flat modules** and **nested feature modules** for organizing your codebase.

### Flat Modules (Standard)

1. Make a directory under `modules/YourFeature`
2. Define your namespace in PHP files:

   ```php
   <?php declare(strict_types=1);
   namespace Modules\YourFeature\Api;

   // … your controllers, routers, etc.
   ```
3. In `modules/YourFeature/Api/api.php` register routes:

   ```php
   <?php declare(strict_types=1);
   namespace Modules\YourFeature\Api;

   use Modules\YourFeature\Controllers\FeatureController;

   router()
     ->resource('feature', FeatureController::class);
   ```

### Nested Feature Modules

For large modules with multiple sub-domains, Proto supports nested feature modules. This allows you to organize related features hierarchically while keeping them self-contained.

**Directory Structure:**
```
modules/
  Community/
    CommunityModule.php           # Parent module class
    Main/                          # Root-level module code (optional)
      Api/
        api.php                    # Handles /api/community
      Controllers/
      Models/
    Group/                         # Nested feature
      Api/
        api.php                    # Handles /api/community/group
      Controllers/
      Models/
      Migrations/
    Events/                        # Another nested feature
      Api/
        api.php                    # Handles /api/community/events
      Controllers/
      Models/
    Gateway/
      Gateway.php                  # Parent gateway with feature access
```

**URL Resolution:**

| URL | Resolution Path |
|-----|----------------|
| `/api/community` | `modules/Community/Main/Api/api.php` |
| `/api/community/group` | `modules/Community/Group/Api/api.php` |
| `/api/community/group/settings` | `modules/Community/Group/Api/Settings/api.php` |
| `/api/community/events` | `modules/Community/Events/Api/api.php` |

**Gateway Access Pattern:**

Parent gateways expose nested features as methods:

```php
<?php declare(strict_types=1);
namespace Modules\Community\Gateway;

use Modules\Community\Group\Gateway\Gateway as GroupGateway;
use Modules\Community\Events\Gateway\Gateway as EventsGateway;

class Gateway
{
    public function group(): GroupGateway
    {
        return new GroupGateway();
    }

    public function events(): EventsGateway
    {
        return new EventsGateway();
    }
}
```

**Usage:**
```php
// Access nested feature gateway
modules()->community()->group()->addMember($userId, $groupId);

// Access nested feature with versioning
modules()->community()->group()->v1()->createGroup($data);
```

**When to Use Nested Features:**
- Module has 3+ distinct sub-domains
- Features are self-contained with their own Controllers, Models, and Services
- You want to organize large modules hierarchically
- Keeping related functionality grouped improves maintainability

**Key Points:**
- Parent modules are registered as usual—nested features are automatically available
- Existing flat modules continue to work (backward compatible)
- Each feature can have its own Migrations folder
- Migrations are discovered recursively (up to 6 levels deep)

---

## 🛠️ Developer Tools

A simple admin UI lets you:

* Scaffold modules, controllers, models, migrations, etc.
* Run migrations, view error logs, dispatch jobs
* Manage users, permissions, and system settings

**Access Developer Tools:**
1. Start backend: `docker-compose -f infrastructure/docker-compose.yaml up -d`
2. Start developer app: `cd apps/developer && npm run dev`
3. Visit: http://localhost:3002

---

## Screenshots

![Generator Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/generator-page.png)
![Generator Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/generator-modal.png)
![Migration Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/migration-page.png)
![Error Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/error-page.png)
![Error Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/error-modal.png)
![Documentation Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/documentation-page.png)
![Users Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/users-page.png)
![User Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/user-page.png)
![IAM Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/iam-page.png)
![IAM Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/iam-modal.png)
![Email Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/email-page.png)
![Client Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/client-page.png)
![Settings Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/settings-page.png)

---

## 🧪 Testing

### Running Tests

This project uses PHPUnit for backend testing. Tests are organized into Unit and Feature test suites.

```bash
# Run all tests
docker compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit

# Run specific test suite
docker compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --testsuite=Feature
docker compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --testsuite=Unit

# Run specific test file
docker compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit modules/User/Tests/Unit/UserRolesTest.php

# Generate coverage report
docker compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --coverage-html coverage/
```

### Test Documentation

- **[Quick Test Guide](infrastructure/docs/QUICK-TEST-GUIDE.md)** - Templates, examples, and patterns for writing tests quickly

---

## 🔧 Troubleshooting

### Common Issues

**Docker not starting:**
- Ensure Docker Desktop is running
- Check that virtualization is enabled in BIOS/UEFI
- On Windows, ensure WSL2 is installed and updated

**Port conflicts:**
- Default ports: 3000-3002 (Vite dev servers), 8080 (API), 8081 (PHPMyAdmin), 3307 (DB), 6380 (Redis)
- Stop conflicting services or modify ports in `infrastructure/docker-compose.yaml` (backend) or `vite.config.js` (frontend)

**Database connection issues:**
```bash
# Check if containers are running
docker compose -f infrastructure/docker-compose.yaml ps

# Restart database
docker compose -f infrastructure/docker-compose.yaml restart mariadb

# Check logs
docker compose -f infrastructure/docker-compose.yaml logs mariadb
```

**Frontend issues:**
```bash
# Clear Vite cache
rm -rf apps/*/node_modules/.vite

# Reinstall dependencies
cd apps/main && npm install
cd ../crm && npm install
cd ../developer && npm install
```

**API connectivity issues:**
- Frontend apps proxy `/api` requests to `https://localhost:8443`
- Check if backend container is running: `docker compose -f infrastructure/docker-compose.yaml ps`
- Test API directly: visit `https://localhost:8443/api/auth/csrf-token`

For more detailed troubleshooting, see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## 🤝 Contributing

1. Fork this repo
2. Create a branch (`git checkout -b feature/xyz`)
3. Make your changes, commit & push
4. Open a Pull Request against `main`
5. We’ll review & merge!

Please follow our [CONTRIBUTING.md](CONTRIBUTING.md) for code standards.

---

## 📄 License

This project is licensed under MIT. See [LICENSE](LICENSE).

---

> Build fast, stay modular, ship secure.
> — The Proto Framework Team
