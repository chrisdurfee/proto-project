# PHP Configuration Migration from XAMPP to Linux/Docker

## Overview
This document describes the migration of PHP configuration from Windows/XAMPP to the Linux/Docker Proto Project environment, completed as part of the PHP 8.4 upgrade.

## Configuration Files Created

### 1. Development Configuration
**File**: `infrastructure/docker/php/php.ini`

**Purpose**: Development environment with verbose error reporting and relaxed settings for debugging.

**Key Settings**:
- Error reporting: Full (`E_ALL`), displayed on screen
- Memory limit: 512M
- Max execution time: 300 seconds
- Upload limits: 100M files, 100M post data
- OPcache JIT: Enabled with 128M buffer
- Timezone: America/Denver
- Display errors: Enabled for debugging

**Extensions Enabled**:
- bz2, curl, fileinfo, gettext, gmp
- intl, mbstring, exif, mysqli
- openssl, pdo_mysql, sockets, zip

### 2. Production Configuration
**File**: `infrastructure/docker/php/php-production.ini`

**Purpose**: Production environment with security hardening and performance optimization.

**Key Differences from Development**:
- Error display: Disabled (logs only)
- OPcache JIT buffer: 256M (vs 128M dev)
- OPcache memory: 512M (vs 256M dev)
- Max accelerated files: 30000 (vs 20000 dev)
- Realpath cache: 8192K (vs 4096K dev)
- Session security: HTTP-only and secure cookies enforced
- PHP exposure: Disabled (`expose_php=Off`)
- Timestamp validation: Disabled for OPcache (`validate_timestamps=0`)

## Integration Architecture

### Docker Build Time
**File**: `infrastructure/docker/Dockerfile` (lines 50-56)

```dockerfile
# Copy custom PHP configuration
COPY infrastructure/docker/php/php.ini /usr/local/etc/php/conf.d/custom-php.ini
```

**What Happens**:
- Development configuration is copied into the image by default
- Placed in `/usr/local/etc/php/conf.d/` for automatic loading
- Named `custom-php.ini` to ensure proper load order

### Runtime Environment Switching
**File**: `infrastructure/docker/entrypoint.sh` (lines 183-211)

**Logic**:
```bash
if [ "${APP_ENV}" = "production" ]; then
    # Copy production config over development config
    cp infrastructure/docker/php/php-production.ini /usr/local/etc/php/conf.d/custom-php.ini
    
    # Apply production OPcache overrides
    # (preload, validate_timestamps=0, etc.)
else
    # Use development config (already in place)
    # Apply development OPcache overrides
fi
```

**Environment Variables**:
- `APP_ENV=production` → Production configuration
- `APP_ENV=development` (or unset) → Development configuration

## Migration from XAMPP

### Settings Preserved
All critical XAMPP settings were migrated:
- ✅ Extension loading (mysqli, curl, gd, etc.)
- ✅ Memory and execution limits
- ✅ Upload/POST size limits
- ✅ Session configuration
- ✅ Error reporting preferences
- ✅ Timezone settings

### Settings Adapted for Docker
Changes made for containerized environment:
- **Paths**: Changed from Windows (`C:\xampp\...`) to Linux (`/tmp`, `/var/www/html`)
- **Session storage**: Using `/tmp` instead of XAMPP temp directory
- **Error logs**: Configured for container stdout/stderr
- **Socket paths**: Removed Windows-specific MySQL socket configurations

### PHP 8.4 Enhancements Added
New optimizations not in XAMPP:
- **OPcache JIT**: Tracing mode (1255) with dedicated buffer
- **Preloading**: Production uses class preloading for faster bootstrapping
- **Improved caching**: Larger realpath cache, more accelerated files
- **Security hardening**: HTTP-only cookies, secure flags, reduced PHP exposure

## Configuration Load Order

PHP loads configuration files in this order:
1. `/usr/local/etc/php/php.ini` (if present, not used in our setup)
2. `/usr/local/etc/php/conf.d/*.ini` (alphabetically)
   - `custom-php.ini` ← Our comprehensive configuration
   - `docker-php-ext-*.ini` ← Extension configs
   - `zz-env-overrides.ini` ← Runtime environment overrides

**Why `zz-env-overrides.ini`?**
- Prefix `zz-` ensures it loads last (alphabetical order)
- Allows runtime overrides without modifying main config
- Environment-specific settings can override base configuration

## Verification Steps

### Check Active Configuration
```bash
# Inside container
docker compose -f infrastructure/docker-compose.yaml exec web php -i | grep -E "(memory_limit|upload_max|opcache.jit|Configuration File)"

# Expected output:
# Configuration File => /usr/local/etc/php/conf.d/custom-php.ini
# memory_limit => 512M
# upload_max_filesize => 100M
# opcache.jit => 1255
# opcache.jit_buffer_size => 128M (dev) or 256M (prod)
```

### Check Loaded Extensions
```bash
docker compose -f infrastructure/docker-compose.yaml exec web php -m
```

Should include: mysqli, curl, gd, mbstring, xml, zip, bcmath, intl, opcache, redis

### Check OPcache JIT Status
```bash
docker compose -f infrastructure/docker-compose.yaml exec web php -r "var_dump(opcache_get_status());"
```

Look for:
- `jit => [ "enabled" => true, "buffer_size" => ... ]`
- `opcache_statistics => [ "num_cached_scripts" => ... ]`

## Troubleshooting

### Issue: Configuration not taking effect
**Solution**: Restart PHP-FPM or the entire container
```bash
docker compose -f infrastructure/docker-compose.yaml restart web
```

### Issue: Different behavior in dev vs production
**Check**: Verify `APP_ENV` environment variable
```bash
docker compose -f infrastructure/docker-compose.yaml exec web env | grep APP_ENV
```

### Issue: Extensions not loading
**Check**: Extension installation in Dockerfile
```bash
# Verify extensions are installed
docker compose -f infrastructure/docker-compose.yaml exec web php -m | grep -i mysqli
```

## Performance Impact

### OPcache JIT Benefits
- **Baseline**: ~20-30% performance improvement on compute-heavy code
- **Optimized**: Up to 3x faster for mathematical operations, loops, type juggling
- **Web APIs**: ~15-25% improvement in typical JSON API responses

### Memory Considerations
- **Development**: 512M per request should handle most scenarios
- **Production**: Monitor actual usage with APM tools
- **OPcache**: 256M-512M is sized for medium-large codebases

### Recommended Monitoring
```bash
# Check OPcache memory usage
docker compose exec web php -r "print_r(opcache_get_status()['memory_usage']);"

# Watch for memory exhaustion
docker compose exec web tail -f /var/log/apache2/error.log | grep -i "memory"
```

## Related Documentation
- [PHP-8.4-UPGRADE.md](./PHP-8.4-UPGRADE.md) - Complete PHP 8.4 upgrade guide
- [CHANGELOG.md](./CHANGELOG.md) - Project change history
- [infrastructure/docs/PRODUCTION-DEPLOYMENT.md](./infrastructure/docs/PRODUCTION-DEPLOYMENT.md) - Production deployment guide

## Maintenance Notes

### Updating PHP Configuration
1. Edit `infrastructure/docker/php/php.ini` (development) or `php-production.ini` (production)
2. Rebuild container: `docker compose build --no-cache web`
3. Restart: `docker compose up -d web`
4. Verify: Check phpinfo() or use `php -i`

### Adding New Extensions
1. Update Dockerfile to install the extension
2. Add extension configuration to php.ini if needed
3. Rebuild and test

### Environment-Specific Overrides
For settings that differ between environments but don't warrant separate files, use `entrypoint.sh` to generate runtime overrides in `/usr/local/etc/php/conf.d/zz-env-overrides.ini`.

---

**Migration Date**: 2025
**PHP Version**: 8.4.13
**Configuration Source**: Windows XAMPP php.ini (adapted)
**Target Environment**: Linux Docker (Debian-based PHP 8.4-FPM image)
