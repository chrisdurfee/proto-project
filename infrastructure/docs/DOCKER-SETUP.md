# Proto Project - Hybrid Development Setup

This setup provides a **hybrid development environment** that combines containerized backend services with local frontend development for optimal performance.

## Architecture

- **Backend Services**: Run in Docker containers (PHP, MariaDB, Redis, PHPMyAdmin)
- **Frontend Apps**: Run locally with native Vite dev servers for lightning-fast hot reload

## Quick Start

### 1. Start Backend Services
```bash
docker-compose up -d
```

### 2. Start Frontend Apps
In separate terminals, start each frontend app:

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

## Available Services

| Service | URL | Description | Environment |
|---------|-----|-------------|-------------|
| Main App | http://localhost:3000 | Main application frontend | Local Vite |
| CRM App | http://localhost:3001 | CRM interface | Local Vite |
| Developer App | http://localhost:3002 | Developer tools UI | Local Vite |
| API Server | http://localhost:8080 | PHP backend API | Docker |
| PHPMyAdmin | http://localhost:8081 | Database management | Docker |
| MariaDB | localhost:3307 | Database server | Docker |
| Redis | localhost:6380 | Cache server | Docker |

## Development Workflow

### Backend Development

1. **Start Backend Services**
   ```bash
   docker-compose up -d
   ```

2. **View Backend Logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f web
   docker-compose logs -f mariadb
   ```

3. **Access Backend Containers**
   ```bash
   # PHP web container
   docker-compose exec web bash

   # Database
   docker-compose exec mariadb mariadb -uroot -proot proto
   ```

4. **Stop Backend Services**
   ```bash
   docker-compose down
   ```

### Frontend Development

1. **Start Individual Apps** (in separate terminals):
   ```bash
   cd apps/main && npm run dev      # Main app on :3000
   cd apps/crm && npm run dev       # CRM app on :3001
   cd apps/developer && npm run dev # Developer app on :3002
   ```

2. **Development Features**:
   - **Instant Hot Reload**: File changes update browser immediately
   - **Native Performance**: Vite runs on your host machine
   - **API Proxy**: `/api` requests automatically route to containerized backend
   - **Full Dev Tools**: Complete browser debugging capabilities

## Frontend Development

- **Lightning-Fast HMR**: Native Vite performance with instant hot module replacement
- **API Proxy**: Frontend apps automatically proxy `/api` requests to containerized backend at `localhost:8080`
- **No Containers**: Frontend runs directly on your host machine for maximum performance
- **Independent**: Each app can be started/stopped independently

## Backend Development

- **File Sync**: The PHP container mounts your local code for real-time changes
- **Database**: MariaDB 11.7.2 with Proto database pre-configured
- **Cache**: Redis available for session storage and caching
- **API Access**: Backend accessible at `http://localhost:8080/api/*`

## Configuration

### Environment Files
- `common/Config/.env` - Main application configuration

### Vite Configuration
Each frontend app (`apps/main`, `apps/crm`, `apps/developer`) has its own `vite.config.js` that:
- Runs on `localhost` with dedicated ports (3000, 3001, 3002)
- Proxies `/api` requests to `http://localhost:8080` (containerized backend)
- Provides instant hot module replacement

### Docker Configuration
- `Dockerfile` - PHP web server container
- `docker-compose.yaml` - Backend services only (web, mariadb, redis, phpmyadmin)

## Troubleshooting

### Port Conflicts
Default ports used:
- **Frontend**: 3000 (main), 3001 (crm), 3002 (developer) - can be changed in `vite.config.js`
- **Backend**: 8080 (API), 8081 (PHPMyAdmin), 3307 (MariaDB), 6380 (Redis)

If you get conflicts with XAMPP or other services:
- Stop XAMPP or conflicting services
- Or modify ports in `docker-compose.yaml` (backend) or `vite.config.js` (frontend)

### Database Connection Issues
```bash
# Check if MariaDB is running
docker-compose ps mariadb

# Test database connection
docker-compose exec mariadb mariadb -uroot -proot -e "SELECT 1;"

# Restart if needed
docker-compose restart mariadb
```

### Frontend Issues
```bash
# Clear Vite cache
rm -rf apps/*/node_modules/.vite

# Reinstall dependencies
cd apps/main && npm install
cd ../crm && npm install
cd ../developer && npm install

# Check if backend is accessible
curl http://localhost:8080/api/auth/csrf-token
```

### API Connectivity Issues
- Frontend apps expect backend at `http://localhost:8080`
- Check if backend container is running: `docker-compose ps web`
- Test API directly: visit `http://localhost:8080/api/auth/csrf-token`
- Check browser developer console for CORS or network errors

### Logs
```bash
# Backend logs
docker-compose logs web
docker-compose logs mariadb

# Frontend logs are visible in the terminal where you ran `npm run dev`
```

## Migration from XAMPP

1. **Stop XAMPP** services to avoid port conflicts
2. **Export Database** from XAMPP MySQL (if needed)
3. **Start Backend Services**: `docker-compose up -d`
4. **Import Database** using PHPMyAdmin at http://localhost:8081
5. **Install Frontend Dependencies**: `npm install` in each `apps/*` directory
6. **Start Frontend Apps**: Run `npm run dev` in each app directory
7. **Update IDE/Editor** database connections to use `localhost:3307`

## Benefits of Hybrid Development

- **Best Performance**: Native Vite development with instant hot reload
- **Clean Separation**: Backend containerized, frontend runs locally
- **Easy Backend Setup**: No PHP/MySQL installation required
- **Consistent Backend**: Same backend environment across team members
- **Development Speed**: Fastest possible frontend development experience
- **Easy Debugging**: Full browser dev tools and native performance
- **Flexible**: Can develop frontend and backend independently

## Production Deployment

When ready to deploy to production, the project includes SSL certificate setup:

### SSL Certificate Setup (Let's Encrypt)

For production deployment with automatic SSL certificates:

```bash
# Linux/macOS
chmod +x setup-ssl.sh
./setup-ssl.sh yourdomain.com your-email@yourdomain.com

# Windows
setup-ssl.bat yourdomain.com your-email@yourdomain.com
```

This automated script will:
- ✅ Request free Let's Encrypt SSL certificates for all subdomains
- ✅ Configure Apache for HTTPS
- ✅ Set up automatic certificate renewal
- ✅ Create production deployment files

### Production Docker Deployment

After SSL setup, deploy with production configuration:

```bash
# Use production Docker Compose with SSL support
docker-compose -f docker-compose.prod.yaml up -d
```

This provides:
- HTTPS for all subdomains (api, app, crm, dev)
- Production-optimized containers
- Automatic certificate renewal
- Proper security headers and CORS

### Production URLs Structure

Based on your domain configuration:
```
https://api.yourdomain.com    → Backend API
https://app.yourdomain.com    → Main Application
https://crm.yourdomain.com    → CRM Interface
https://dev.yourdomain.com    → Developer Tools
```

For detailed production deployment instructions and advanced SSL options, see [SUBDOMAIN-DEPLOYMENT.md](SUBDOMAIN-DEPLOYMENT.md).
