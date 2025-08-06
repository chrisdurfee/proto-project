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

## 🐳 Local Development (Containerized)

This project includes a complete containerized development environment using Docker. No need for XAMPP, WAMP, or local PHP/MySQL installations!

### Quick Start

**Windows:**
```cmd
setup-dev.bat
```

**Linux/macOS:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

**Manual Setup:**
```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec web php run-migrations.php

# Install frontend dependencies (if needed)
docker-compose exec vite-main npm install
docker-compose exec vite-crm npm install
docker-compose exec vite-developer npm install
```

### Available Services

Once running, you'll have access to:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Main App | http://localhost:3000 | Frontend development server |
| 🌐 CRM App | http://localhost:3001 | CRM frontend development server |
| 🌐 Developer Tools | http://localhost:3002 | Developer UI with scaffolding tools |
| 🚀 API Server | http://localhost:8080 | PHP backend API |
| 🗄️ PHPMyAdmin | http://localhost:8081 | Database management interface |
| 🗄️ Database | localhost:3307 | MariaDB 11.7.2 server |
| 📝 Cache | localhost:6380 | Redis server |

### Development Workflow

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web
docker-compose logs -f vite-main

# Access containers
docker-compose exec web bash           # PHP container
docker-compose exec mariadb mariadb -uroot -proot proto  # Database

# Stop development environment
docker-compose down
```

### Features

- **🔥 Hot Reload**: Frontend changes automatically refresh the browser
- **🔗 API Proxy**: Frontend apps proxy `/api` requests to PHP backend
- **🗄️ Database**: MariaDB with persistent data
- **📦 Package Management**: Automatic npm/composer dependency handling
- **🛠️ Developer Tools**: Built-in scaffolding and migration tools

For detailed setup instructions, see [DOCKER-SETUP.md](DOCKER-SETUP.md).

---

## 🏗️ Directory Layout

```text
my-app/
├─ apps/                   # Your front-end PWAs (CRM, developer UI, etc.)
├─ common/                 # Shared code (helpers, config, utilities)
├─ modules/                # Feature modules (user, product, auth, …)
├─ public/                 # HTTP entrypoints & public assets
│   └─ api/
│       └─ index.php       # Example API bootstrap
├─ composer.json
└─ vendor/
   └─ protoframework/
      └─ proto/            # The Proto Framework core (do not edit)
```

---

## ⚙️ Configuration

Your application-specific settings live in **`common/Config/.env`**. Proto reads JSON-encoded environment variables from there:

```dotenv
# common/Config/.env
{
  "APP_ENV": "dev",
}
```

---

## 🚀 Bootstrapping & Usage

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
- **Containerized**: http://localhost:3002 (after running `setup-dev.bat` or `docker-compose up -d`)
- **Traditional**: Point your browser to `/developer` after `composer install`

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
- Default ports: 3000-3002 (Vite), 8080 (API), 8081 (PHPMyAdmin), 3307 (DB), 6380 (Redis)
- Stop conflicting services or modify ports in `docker-compose.yaml`

**Database connection issues:**
```bash
# Check if containers are running
docker-compose ps

# Restart database
docker-compose restart mariadb

# Check logs
docker-compose logs mariadb
```

**Frontend build errors:**
```bash
# Clear and rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

For more detailed troubleshooting, see [DOCKER-SETUP.md](DOCKER-SETUP.md).

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
