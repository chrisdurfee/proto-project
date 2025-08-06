# Proto Project - Containerized Development

This setup provides a complete containerized development environment that replaces XAMPP with Docker containers.

## Quick Start

### Windows (PowerShell/Command Prompt)
```cmd
setup-dev.bat
```

### Linux/macOS (Bash)
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

### Manual Setup
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

## Available Services

| Service | URL | Description |
|---------|-----|-------------|
| Main App (Vite) | http://localhost:3000 | Frontend development server |
| CRM App (Vite) | http://localhost:3001 | CRM frontend development server |
| Developer App (Vite) | http://localhost:3002 | Developer tools frontend |
| API Server | http://localhost:8080 | PHP backend API |
| PHPMyAdmin | http://localhost:8081 | Database management |
| MariaDB | localhost:3307 | Database server |
| Redis | localhost:6380 | Cache server |

## Development Workflow

1. **Start Development Environment**
   ```bash
   docker-compose up -d
   ```

2. **View Logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f web
   docker-compose logs -f vite-main
   ```

3. **Access Containers**
   ```bash
   # PHP web container
   docker-compose exec web bash

   # Database
   docker-compose exec mariadb mysql -uroot -proot proto
   ```

4. **Stop Environment**
   ```bash
   docker-compose down
   ```

## Frontend Development

- **Hot Reload**: All Vite development servers support hot module replacement
- **API Proxy**: Frontend apps automatically proxy `/api` requests to the PHP backend
- **Environment Variables**: Use `VITE_API_URL` to configure API endpoint
- **File Watching**: Changes to your frontend code will automatically reload the browser

## Backend Development

- **File Sync**: The PHP container mounts your local code for real-time changes
- **Database**: MariaDB 11.7.2 with Proto database pre-configured
- **Cache**: Redis available for session storage and caching
- **Migrations**: Run `docker-compose exec web php run-migrations.php` to update database schema

## Configuration

### Environment Files
- `common/Config/.env-docker` - Docker-specific configuration
- `common/Config/.env-local` - Local development configuration (XAMPP)

### Vite Configuration
Each frontend app (`apps/main`, `apps/crm`, `apps/developer`) has its own `vite.config.js` that:
- Binds to `0.0.0.0` for container access
- Uses environment variable `VITE_API_URL` for API endpoint
- Proxies `/api` requests to the backend

### Docker Configuration
- `Dockerfile` - PHP web server container
- `docker/vite.Dockerfile` - Node.js container for Vite development servers
- `docker-compose.yaml` - Complete multi-service setup

## Troubleshooting

### Port Conflicts
If you get port conflicts, check if XAMPP or other services are running:
- XAMPP MySQL: 3306 (we use 3307)
- XAMPP Apache: 80 (we use 8080)
- Redis: 6379 (we use 6380)

### Database Connection Issues
```bash
# Check if MariaDB is running
docker-compose ps mariadb

# Test database connection
docker-compose exec mariadb mysql -uroot -proot -e "SELECT 1;"
```

### Frontend Build Issues
```bash
# Rebuild Vite containers
docker-compose build vite-main vite-crm vite-developer

# Clear npm cache
docker-compose exec vite-main npm cache clean --force
```

### Logs
```bash
# Check specific service logs
docker-compose logs web
docker-compose logs mariadb
docker-compose logs vite-main
```

## Migration from XAMPP

1. **Stop XAMPP** services to avoid port conflicts
2. **Export Database** from XAMPP MySQL (if needed)
3. **Run Setup Script** to start containerized environment
4. **Import Database** using PHPMyAdmin at http://localhost:8081
5. **Update IDE/Editor** database connections to use `localhost:3307`

## Benefits of Containerized Development

- **Consistent Environment**: Same setup across all team members
- **Version Control**: Docker configurations are versioned with your code
- **Isolation**: No conflicts with system-installed services
- **Easy Cleanup**: Remove containers and volumes without affecting your system
- **Production Parity**: Closer to production environment setup
- **Multi-Version Support**: Easy to switch between different PHP/database versions
