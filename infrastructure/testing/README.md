# Production Testing Infrastructure

This directory contains tools and configurations for testing the production container setup.

## Files

### Scripts
- `quick-prod-test.sh` - Main production container test script
- Run from project root: `./test-production` (wrapper script)

### Configurations
- `docker-compose.prod-test.yaml` - Test-specific Docker Compose configuration with Traefik and SSL

### Documentation
- `../docs/PRODUCTION-TESTING-GUIDE.md` - Comprehensive testing guide

## Usage

From the project root directory:

```bash
# Quick production test
./test-production

# Or run directly
infrastructure/testing/quick-prod-test.sh

# Advanced testing with subdomains/SSL (when ready)
docker-compose -f docker-compose.yaml -f infrastructure/testing/docker-compose.prod-test.yaml up -d
```

## What Gets Tested

✅ Docker daemon connectivity
✅ Vite app builds
✅ Container startup
✅ Health endpoint
✅ All app endpoints (main, crm, developer)
✅ Production environment settings

The test ensures your production container works correctly with all built Vite applications.