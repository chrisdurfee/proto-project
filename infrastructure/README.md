# Infrastructure

This directory contains all development and deployment infrastructure for the Proto Project.

## 📁 Directory Structure

```
infrastructure/
├─ config/          # Configuration files
│  ├─ domain.config.js              # Domain configuration system
│  ├─ docker-compose.production.yaml # Production Docker setup
│  └─ docker-compose.traefik.yaml   # Traefik reverse proxy setup
├─ docker/          # Docker-related files
│  ├─ apache-subdomain.conf         # Apache virtual host for subdomains
│  ├─ apache-vhost.conf             # Standard Apache virtual host
│  ├─ php/php.ini                   # PHP configuration
│  └─ mysql/                        # MySQL initialization scripts
├─ docs/            # Documentation
│  ├─ DEVELOPMENT.md                # Development setup guide
│  ├─ DOCKER-SETUP.md               # Docker setup instructions
│  ├─ SSL-SETUP.md                  # SSL certificate setup
│  ├─ SUBDOMAIN-DEPLOYMENT.md       # Production deployment guide
│  └─ DOMAIN-CONFIGURATION.md       # Domain configuration guide
└─ scripts/         # Build and utility scripts
   ├─ build-production.*            # Production build scripts
   ├─ setup-ssl.*                   # SSL certificate setup
   ├─ setup-dev.*                   # Development environment setup
   ├─ sync-config.*                 # Configuration sync scripts
   └─ run-migrations.php            # Database migration runner
```

## 🚀 Quick Access

From the project root, you can run any script using the script runner:

```bash
# Configuration
./run.sh sync-config

# SSL Setup
./run.sh setup-ssl yourdomain.com admin@yourdomain.com

# Production Build
./run.sh build

# Show all available commands
./run.sh help
```

## 📚 Documentation

- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Complete development setup guide
- **[SSL-SETUP.md](docs/SSL-SETUP.md)** - SSL certificate configuration
- **[SUBDOMAIN-DEPLOYMENT.md](docs/SUBDOMAIN-DEPLOYMENT.md)** - Production deployment
- **[DOMAIN-CONFIGURATION.md](docs/DOMAIN-CONFIGURATION.md)** - Domain configuration system

## ⚙️ Configuration Files

- **domain.config.js** - Centralized domain configuration system
- **docker-compose.production.yaml** - Production Docker Compose setup
- **docker-compose.traefik.yaml** - Traefik reverse proxy configuration

All configuration files support the centralized domain configuration system that reads from `common/Config/.env`.
