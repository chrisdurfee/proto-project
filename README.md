# Proto Project

This repository is a **project skeleton** for building applications on top of the [Proto Framework](https://github.com/protoframework/proto). It wires up Composer, your folder structure, and a minimal entrypoint so you can start writing modules and apps right away.

---

## � Prerequisites

### For Containerized Development (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine (Linux)
- Git

### For Traditional Development
- PHP 8.2+
- Composer
- MySQL/MariaDB
- Node.js (for frontend development)

---

## �📦 Installation

Choose one of the two approaches:

### 1. Create a brand-new project via Composer

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

First, sync your Proto configuration to Docker:

```bash
# Generate Docker .env from Proto configuration
./run.sh sync-config

# Or run directly: node sync-config.js
```

### Quick Start

**1. Start Backend Services:**
```bash
docker-compose up -d
```

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
| 🌐 Main App | http://localhost:3000 | Main application (Vite dev server) |
| 🌐 CRM App | http://localhost:3001 | CRM interface (Vite dev server) |
| 🌐 Developer Tools | http://localhost:3002 | Developer UI with scaffolding tools (Vite dev server) |
| 🚀 API Server | http://localhost:8080 | PHP backend API (containerized) |
| 🗄️ PHPMyAdmin | http://localhost:8081 | Database management interface |
| 🗄️ Database | localhost:3307 | MariaDB 11.7.2 server |
| 📝 Cache | localhost:6380 | Redis server |

### Development Workflow

**Backend Changes:**
```bash
# View API logs
docker-compose logs -f web

# Access PHP container
docker-compose exec web bash

# Restart backend if needed
docker-compose restart web
```

**Frontend Changes:**
- Edit any `.js`, `.css`, or other frontend files
- Changes appear instantly in browser (hot module reload)
- No need to restart anything!

**Database Management:**
```bash
# Access database directly
docker-compose exec mariadb mariadb -uroot -proot proto

# Or use phpMyAdmin at http://localhost:8081
```

### Why This Approach?

✅ **Lightning Fast HMR**: Native Vite performance on your host machine
✅ **Instant Updates**: File changes reflect immediately in browser
✅ **Clean Architecture**: Backend and frontend properly separated
✅ **Easy API Access**: Frontend apps automatically proxy `/api` requests to containerized backend
✅ **No Setup Complexity**: No need for local PHP/MySQL installation

For detailed setup instructions, see [infrastructure/docs/DEVELOPMENT.md](infrastructure/docs/DEVELOPMENT.md).

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
│  │  ├─ docker-compose.prod.yaml # Production Docker setup
│  │  └─ docker-compose.traefik.yaml # Traefik reverse proxy
│  ├─ docker/              # Docker-related files
│  │  ├─ apache-subdomain.conf # Apache virtual host config
│  │  ├─ apache-vhost.conf # Standard Apache config
│  │  ├─ php/              # PHP configuration
│  │  └─ mysql/            # MySQL initialization scripts
│  ├─ docs/                # Documentation
│  │  ├─ DEVELOPMENT.md    # Development setup guide
│  │  ├─ SSL-SETUP.md      # SSL certificate setup
│  │  ├─ SUBDOMAIN-DEPLOYMENT.md # Production deployment
│  │  └─ ...               # Other documentation
│  └─ scripts/             # Build and setup scripts
│     ├─ build-production.* # Production build scripts
│     ├─ setup-ssl.*       # SSL certificate setup
│     ├─ sync-config.*     # Configuration sync scripts
│     └─ ...               # Other utility scripts
├─ docker-compose.yaml     # Development Docker setup
├─ sync-config.js          # Configuration sync utility
├─ run.sh / run.bat        # Script runner
└─ README.md               # This file
```

---

## 🚀 Quick Commands

```bash
# Configuration
./run.sh sync-config              # Sync Proto config to Docker
node sync-config.js               # Alternative: direct sync

# Development
docker-compose up -d              # Start backend services
cd apps/main && npm run dev       # Start main app
cd apps/crm && npm run dev        # Start CRM app
cd apps/developer && npm run dev  # Start developer tools

# Production
./run.sh setup-ssl yourdomain.com your-email@domain.com  # Setup SSL
./run.sh build                    # Build all apps for production
docker-compose -f infrastructure/config/docker-compose.prod.yaml up -d  # Deploy production

# Utilities
./run.sh migrations               # Run database migrations
./run.sh help                     # Show all available scripts
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
        "api": 8080,
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
./run.sh setup-ssl yourdomain.com your-email@yourdomain.com

# Windows
run.bat setup-ssl yourdomain.com your-email@yourdomain.com
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

---

## 🛠️ Developer Tools

A simple admin UI lets you:

* Scaffold modules, controllers, models, migrations, etc.
* Run migrations, view error logs, dispatch jobs
* Manage users, permissions, and system settings

**Access Developer Tools:**
1. Start backend: `docker-compose up -d`
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
![Users Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/user-page.png)
![IAM Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/iam-page.png)
![IAM Modal](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/iam-modal.png)
![Email Page](https://raw.githubusercontent.com/chrisdurfee/proto-project/refs/heads/main/public/images/product/email-page.png)

---

## 🔧 Troubleshooting

### Common Issues

**Docker not starting:**
- Ensure Docker Desktop is running
- Check that virtualization is enabled in BIOS/UEFI
- On Windows, ensure WSL2 is installed and updated

**Port conflicts:**
- Default ports: 3000-3002 (Vite dev servers), 8080 (API), 8081 (PHPMyAdmin), 3307 (DB), 6380 (Redis)
- Stop conflicting services or modify ports in `docker-compose.yaml` (backend) or `vite.config.js` (frontend)

**Database connection issues:**
```bash
# Check if containers are running
docker-compose ps

# Restart database
docker-compose restart mariadb

# Check logs
docker-compose logs mariadb
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
- Frontend apps proxy `/api` requests to `http://localhost:8080`
- Check if backend container is running: `docker-compose ps`
- Test API directly: visit `http://localhost:8080/api/auth/csrf-token`

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
