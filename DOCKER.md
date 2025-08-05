# Proto Project - Docker Setup

This document explains how to run the Proto Project using Docker containers.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/proto-project
   ```

2. **Build and start the containers:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Main application: http://localhost:8080
   - CRM application: http://localhost:8080/crm
   - Developer application: http://localhost:8080/developer
   - API: http://localhost:8080/api
   - PHPMyAdmin: http://localhost:8081

## Services

The Docker setup includes the following services:

### Web Server (proto-web)
- **Technology:** PHP 8.2 + Apache
- **Port:** 8080
- **Features:**
  - OPcache enabled for performance
  - All required PHP extensions
  - Optimized Apache configuration
  - URL rewriting for SPA routing

### Database (proto-mariadb)
- **Technology:** MariaDB 11.7.2
- **Port:** 3306
- **Credentials:**
  - Root: `root` / `root`
  - App User: `proto_user` / `proto_password`
  - Database: `proto`

### Cache (proto-redis)
- **Technology:** Redis 7
- **Port:** 6379
- **Configuration:** Persistence enabled

### Database Management (proto-phpmyadmin)
- **Technology:** PHPMyAdmin
- **Port:** 8081
- **Access:** Use MariaDB credentials above

## Development Workflow

### Starting the environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f web

# Check status
docker-compose ps
```

### Stopping the environment
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (caution: will delete database data)
docker-compose down -v
```

### Running commands inside containers
```bash
# Access web container shell
docker-compose exec web bash

# Run Composer commands
docker-compose exec web composer install
docker-compose exec web composer dump-autoload

# Run PHP commands
docker-compose exec web php -v
```

### Database migrations
```bash
# Access the web container and run migrations
docker-compose exec web php public/api/migrate.php
```

## Configuration

### Environment Configuration
The application uses Docker-specific configuration located in:
- `common/Config/.env-docker` - Application configuration
- `.env.docker` - Docker environment variables (optional)

### Custom PHP Settings
PHP configuration is customized via `docker/php/php.ini` with:
- Memory limit: 512M
- Upload max size: 100M
- OPcache optimizations
- Error logging enabled

### Apache Configuration
Apache virtual host is configured in `docker/apache-vhost.conf` with:
- Document root: `/var/www/html/public`
- URL rewriting for API and SPA routes
- Security headers
- Compression enabled

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :8080

   # Change ports in docker-compose.yaml if needed
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   docker-compose exec web chown -R www-data:www-data /var/www/html
   ```

3. **Database connection issues:**
   - Ensure MariaDB container is running: `docker-compose ps`
   - Check database credentials in configuration
   - Verify network connectivity between containers

4. **Redis connection issues:**
   - Check Redis container status: `docker-compose logs redis`
   - Verify Redis host is set to `redis` in configuration

### Logs and Debugging
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs web
docker-compose logs mariadb
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f web
```

### Database Access
```bash
# Connect to MariaDB from command line
docker-compose exec mariadb mysql -u root -p proto

# Or use PHPMyAdmin at http://localhost:8081
```

## Production Considerations

For production deployment, consider:

1. **Security:**
   - Change all default passwords
   - Use environment variables for sensitive data
   - Enable HTTPS/SSL
   - Restrict database access

2. **Performance:**
   - Use multi-stage Docker builds
   - Optimize OPcache settings
   - Configure proper resource limits
   - Use external volumes for persistent data

3. **Monitoring:**
   - Add health checks
   - Configure log aggregation
   - Set up monitoring and alerting

## File Structure

```
docker/
├── apache-vhost.conf    # Apache virtual host configuration
├── php/
│   └── php.ini         # Custom PHP settings
└── mysql/
    └── init.sql        # Database initialization script
```

## Updating

To update the containers:

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```
