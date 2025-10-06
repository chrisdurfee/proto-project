# Quick Start Guide

This guide helps you get Proto Project running in minutes.

---

## 🚀 Quick Setup (5 Minutes)

### 1. Prerequisites

- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
- **Node.js 18+** (for frontend development)
- **Git**

### 2. Clone & Configure

```bash
# Clone the repository
git clone <repository-url>
cd proto-project

# Copy environment files
cp common/Config/.env-example common/Config/.env

# Sync configuration to Docker
./infrastructure/scripts/run.sh sync-config
```

### 3. Start Development Environment

```bash
# Start backend services (PHP, MariaDB, Redis)
docker-compose -f infrastructure/docker-compose.yaml up -d

# Wait for services to be healthy (~30 seconds)
docker-compose -f infrastructure/docker-compose.yaml ps

# Check logs
docker-compose -f infrastructure/docker-compose.yaml logs -f web
```

### 4. Start Frontend Development

Open **3 separate terminals** for each frontend app:

```bash
# Terminal 1 - Main App
cd apps/main
npm install
npm run dev
# → Runs on http://localhost:3000

# Terminal 2 - CRM App
cd apps/crm
npm install
npm run dev
# → Runs on http://localhost:3001

# Terminal 3 - Developer App
cd apps/developer
npm install
npm run dev
# → Runs on http://localhost:3002
```

### 5. Access Your Apps

| App | URL | Purpose |
|-----|-----|---------|
| **Main App** | http://localhost:3000 | Public-facing application |
| **CRM App** | http://localhost:3001 | Customer relationship management |
| **Developer App** | http://localhost:3002 | Developer tools & documentation |
| **API** | http://localhost:8080/api | Backend API |
| **PHPMyAdmin** | http://localhost:8081 | Database management |

---

## 📁 Project Structure

```
proto-project/
├── apps/                    # Frontend applications (Vite + Base Framework)
│   ├── main/               # Main app
│   ├── crm/                # CRM app
│   └── developer/          # Developer tools
├── common/                  # Shared backend code
│   ├── Config/.env         # Main configuration (JSON format)
│   ├── Services/           # Application services
│   └── Migrations/         # Database migrations
├── modules/                 # Feature modules
│   └── */Api/api.php      # Module API routes
├── public/                  # Web root
│   └── api/               # Backend API entry point
├── infrastructure/          # Docker & tooling
│   ├── docker-compose.yaml              # Development setup
│   ├── docker-compose.production.yaml   # Production setup
│   ├── docker/                          # Docker configs
│   │   ├── Dockerfile                   # Container image
│   │   └── entrypoint.sh               # Startup script
│   ├── scripts/                         # Utility scripts
│   │   ├── run.sh                      # Script runner
│   │   └── sync-config.js              # Config sync tool
│   └── docs/                            # Documentation
└── vendor/                  # PHP dependencies (Composer)
```

---

## 🔧 Common Commands

### Backend (Docker)

```bash
# Start all services
docker-compose -f infrastructure/docker-compose.yaml up -d

# Stop all services
docker-compose -f infrastructure/docker-compose.yaml down

# View logs
docker-compose -f infrastructure/docker-compose.yaml logs -f web

# Restart after code changes
docker-compose -f infrastructure/docker-compose.yaml restart web

# Run migrations manually
docker-compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php

# Access container shell
docker-compose -f infrastructure/docker-compose.yaml exec web bash
```

### Frontend (Development)

```bash
# Install dependencies
cd apps/main && npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Configuration

```bash
# Sync config changes to Docker
./infrastructure/scripts/run.sh sync-config

# View available scripts
./infrastructure/scripts/run.sh help
```

---

## 🐛 Troubleshooting

### Port Conflicts

If ports 8080, 8443, 3307, or 6380 are in use:

```bash
# Check what's using the ports
sudo lsof -i :8080
sudo lsof -i :3307

# Stop conflicting services or edit infrastructure/docker-compose.yaml
```

### Database Connection Errors

```bash
# Check if MariaDB is running
docker-compose -f infrastructure/docker-compose.yaml ps mariadb

# Check MariaDB logs
docker-compose -f infrastructure/docker-compose.yaml logs mariadb

# Restart database
docker-compose -f infrastructure/docker-compose.yaml restart mariadb
```

### Vendor Directory Missing

```bash
# Install PHP dependencies
docker-compose -f infrastructure/docker-compose.yaml exec web composer install
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
cd apps/main
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

- **[Full Documentation](README.md)** - Complete project documentation
- **[Production Deployment](infrastructure/docs/PRODUCTION-DEPLOYMENT.md)** - Deploy to production
- **[Docker Setup Guide](infrastructure/docs/DOCKER-SETUP.md)** - Detailed Docker configuration
- **[Development Guide](infrastructure/docs/DEVELOPMENT.md)** - Development best practices
- **[API Documentation](apps/developer)** - Backend API reference

---

## ⚡ Quick Tips

1. **Live Reload**: Frontend apps auto-reload on file changes
2. **API Proxy**: Frontend dev servers proxy `/api` to `http://localhost:8080`
3. **Database**: Default credentials in `.env` file (change for production!)
4. **Hot Module Replacement**: Vite provides instant updates without full page reload
5. **Backend Changes**: Most PHP changes reflect immediately (no restart needed)

---

## 🆘 Getting Help

- Check the [Troubleshooting](#-troubleshooting) section above
- Review logs: `docker-compose -f infrastructure/docker-compose.yaml logs -f`
- Check container health: `docker-compose -f infrastructure/docker-compose.yaml ps`
- See full documentation in `README.md` and `infrastructure/docs/`

---

**Happy Coding!** 🎉
