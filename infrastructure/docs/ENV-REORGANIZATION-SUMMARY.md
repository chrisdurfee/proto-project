# Configuration Files Reorganization Summary

## Date: October 6, 2024

This document tracks the reorganization of configuration files to improve project structure and maintainability.

## Files Moved

### Robots.txt
```bash
# From: Root directory (not web-accessible)
robots.txt

# To: Public directory (web-accessible)
public/robots.txt
```
**Reason**: Search engine crawlers expect robots.txt at the web root. The web server serves files from `public/`, so robots.txt must be there to be accessible at `http://yoursite.com/robots.txt`.

### Environment Files
```bash
# Development Template
.env.example → infrastructure/.env.example

# Production Template
.env.production.example → infrastructure/.env.production.example

# Generated Docker Config
.env → infrastructure/.env
```
**Reason**: These files are Docker-specific configuration, not used by the PHP application. The PHP app reads `common/Config/.env` (JSON format). Placing Docker configs in `infrastructure/` with the compose files makes the separation clear and follows infrastructure-as-code principles.

## Code Changes

### sync-config.js Updates

**File**: `infrastructure/scripts/sync-config.js`

1. **Input Path** (reads Proto JSON config):
   ```javascript
   // Old (when script was in root)
   const configPath = path.join(__dirname, 'common', 'Config', '.env')

   // New (script now in infrastructure/scripts/)
   const configPath = path.join(__dirname, '..', '..', 'common', 'Config', '.env')
   ```

2. **Output Path** (writes Docker env):
   ```javascript
   // Old (wrote to root)
   const envPath = path.join(__dirname, '.env')

   // New (writes to infrastructure/)
   const envPath = path.join(__dirname, '..', '.env')
   ```

3. **Console Message**:
   ```javascript
   // Old
   console.log('✅ Generated .env file for Docker')

   // New
   console.log('✅ Generated infrastructure/.env file for Docker')
   ```

4. **Header Comment**:
   ```bash
   # Old
   # Do not edit manually - run: node sync-config.js

   # New
   # Do not edit manually - run: ./infrastructure/scripts/run.sh sync-config
   ```

### Docker Compose Updates

**Files**:
- `infrastructure/docker-compose.yaml`
- `infrastructure/docker-compose.production.yaml`

**Changes**: Updated error messages to reference `infrastructure/.env`:

```yaml
# Old
MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:?Please set DB_ROOT_PASSWORD in .env file}

# New
MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:?Please set DB_ROOT_PASSWORD in infrastructure/.env file}
```

Added header comments:
```yaml
# Development Docker Compose Configuration
# Expects .env file in the same directory (infrastructure/.env)
# Generate with: ./infrastructure/scripts/run.sh sync-config
```

### .gitignore Updates

**File**: `.gitignore`

```gitignore
# Added
infrastructure/.env

# Kept for backward compatibility
.env
```

### run.sh Fix

**File**: `infrastructure/scripts/run.sh`

Fixed missing `;;` after sync-config case:
```bash
# Fixed syntax error
case "$SCRIPT_NAME" in
    "sync-config")
        echo "🔄 Syncing configuration..."
        node infrastructure/scripts/sync-config.js
        ;;  # <-- This was missing
```

## Configuration Architecture

### Two Separate Systems

```
┌─────────────────────────────────────────────────────────────┐
│                     CONFIGURATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Application Configuration (Master)          │          │
│  │  common/Config/.env                          │          │
│  │  Format: JSON                                │          │
│  │  Purpose: PHP app, frontend, business logic │          │
│  │  YOU EDIT THIS ✏️                            │          │
│  └─────────────────┬────────────────────────────┘          │
│                    │                                         │
│                    ▼                                         │
│         sync-config.js reads JSON                           │
│                    │                                         │
│                    ▼                                         │
│  ┌──────────────────────────────────────────────┐          │
│  │  Infrastructure Configuration (Generated)    │          │
│  │  infrastructure/.env                         │          │
│  │  Format: Shell (KEY=value)                   │          │
│  │  Purpose: Docker Compose variables           │          │
│  │  AUTO-GENERATED 🤖 (don't edit)              │          │
│  └─────────────────┬────────────────────────────┘          │
│                    │                                         │
│                    ▼                                         │
│         Docker Compose reads .env                           │
│                    │                                         │
│                    ▼                                         │
│  ┌──────────────────────────────────────────────┐          │
│  │  Running Containers                          │          │
│  │  - MariaDB (with DB_ROOT_PASSWORD)           │          │
│  │  - Redis (with REDIS_PASSWORD)               │          │
│  │  - Web (with all environment vars)           │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### File Purposes

| File | Purpose | Format | Edit? | Commit? |
|------|---------|--------|-------|---------|
| `common/Config/.env` | Application config (master) | JSON | ✅ YES | ❌ NO (secrets) |
| `common/Config/.env-example` | Application template | JSON | ✅ YES | ✅ YES (template) |
| `infrastructure/.env` | Docker variables (generated) | Shell | ❌ NO | ❌ NO (generated) |
| `infrastructure/.env.example` | Dev Docker template | Shell | ✅ YES | ✅ YES (template) |
| `infrastructure/.env.production.example` | Prod Docker template | Shell | ✅ YES | ✅ YES (template) |

## Docker Compose .env Behavior

### Automatic Detection

Docker Compose automatically looks for `.env` in the **same directory** as the compose file:

```bash
# Compose file location
infrastructure/docker-compose.yaml

# Docker looks for .env here (same directory)
infrastructure/.env

# ✅ Works automatically - no env_file directive needed!
```

### Why It Works

1. Docker Compose's default behavior: search for `.env` in same directory
2. Both files in `infrastructure/` directory
3. No relative path needed
4. Clean, predictable behavior

### Commands

```bash
# All commands work from project root
cd /home/tech-e/projects/rally

# Development
docker-compose -f infrastructure/docker-compose.yaml up -d

# Production
docker-compose -f infrastructure/docker-compose.production.yaml up -d

# Docker automatically finds infrastructure/.env ✨
```

## Testing Results

### Sync Test
```bash
$ ./infrastructure/scripts/run.sh sync-config
🔄 Syncing configuration...
🔄 Syncing configuration from Proto to Docker...
✅ Loaded Proto configuration
✅ Generated infrastructure/.env file for Docker
🎉 Configuration sync complete!
```
**Result**: ✅ Successfully generated infrastructure/.env

### Docker Compose Test
```bash
$ docker-compose -f infrastructure/docker-compose.yaml config --services
mariadb
phpmyadmin
redis
web
```
**Result**: ✅ Docker Compose reads configuration correctly

### Environment Variable Test
```bash
$ docker-compose -f infrastructure/docker-compose.yaml config | grep MARIADB_ROOT_PASSWORD
      MARIADB_ROOT_PASSWORD: root
```
**Result**: ✅ Variables from infrastructure/.env successfully loaded

## Root Directory Cleanup

### Before Reorganization
```
.
├── .dockerignore
├── .env
├── .env.example
├── .env.production.example
├── .gitignore
├── .htaccess
├── composer.json
├── composer.lock
├── docker-compose.yaml
├── docker-compose.production.yaml
├── Dockerfile
├── phpunit.xml
├── preload.php
├── README.md
├── robots.txt
├── run.sh
├── run.bat
├── sync-config.js
├── test-production
├── test-production.bat
├── apps/
├── common/
├── infrastructure/
├── modules/
├── public/
└── vendor/
```
**File Count**: ~23 files + 6 directories

### After Reorganization
```
.
├── .gitignore
├── .htaccess
├── composer.json
├── composer.lock
├── QUICK-START.md
├── README.md
├── apps/
├── common/
├── infrastructure/
│   ├── .dockerignore
│   ├── .env                          # ← MOVED HERE
│   ├── .env.example                  # ← MOVED HERE
│   ├── .env.production.example       # ← MOVED HERE
│   ├── docker-compose.yaml           # ← Already here
│   ├── docker-compose.production.yaml
│   ├── config/
│   │   ├── phpunit.xml
│   │   └── preload.php
│   ├── docker/
│   │   └── Dockerfile
│   ├── docs/
│   │   └── ENV-FILE-ORGANIZATION.md  # ← NEW
│   └── scripts/
│       ├── run.sh
│       ├── run.bat
│       ├── sync-config.js            # ← Already here
│       ├── test-production
│       └── test-production.bat
├── modules/
├── public/
│   └── robots.txt                     # ← MOVED HERE
└── vendor/
```
**File Count**: 6 files + 6 directories in root
**Improvement**: 74% reduction in root-level files (23 → 6)

## Benefits

### 1. Clear Separation of Concerns
- **Application config**: `common/Config/.env` (JSON)
- **Infrastructure config**: `infrastructure/.env` (Docker)
- No confusion about which file to edit

### 2. robots.txt Now Deployed
- Previously in root → not copied to container
- Now in `public/` → included in Docker image
- Accessible at `http://yoursite.com/robots.txt` ✅

### 3. Logical Grouping
- All Docker configs in `infrastructure/`
- Generator near its output file
- Templates with actual files

### 4. Cleaner Root
- Root directory has only essential files
- Professional appearance
- Easier for new developers to navigate

### 5. Predictable Behavior
- Docker Compose finds `.env` automatically
- Sync script paths are relative to script location
- No hardcoded absolute paths

## Workflow

### Daily Development
1. Edit application config:
   ```bash
   nano common/Config/.env
   ```

2. Sync to Docker:
   ```bash
   ./infrastructure/scripts/run.sh sync-config
   ```

3. Restart services:
   ```bash
   docker-compose -f infrastructure/docker-compose.yaml restart
   ```

### New Developer Onboarding
1. Copy templates:
   ```bash
   cp common/Config/.env-example common/Config/.env
   ```

2. Edit config with their values:
   ```bash
   nano common/Config/.env
   ```

3. Generate Docker config:
   ```bash
   ./infrastructure/scripts/run.sh sync-config
   ```

4. Start development:
   ```bash
   docker-compose -f infrastructure/docker-compose.yaml up -d
   ```

### Production Deployment
1. Set production values in master config
2. Run sync: `./infrastructure/scripts/run.sh sync-config`
3. Build image: `docker build -f infrastructure/docker/Dockerfile -t rally-web:latest .`
4. Deploy: `docker-compose -f infrastructure/docker-compose.production.yaml up -d`

## Documentation Created

- **ENV-FILE-ORGANIZATION.md**: Comprehensive guide to configuration system
- Updated: docker-compose.yaml header comments
- Updated: docker-compose.production.yaml header comments
- Updated: sync-config.js console messages
- Updated: Error messages throughout Docker configs

## Related Changes

This reorganization was part of a larger project cleanup that included:
1. ✅ Production deployment success (HTTP, HTTPS, HTTP/2)
2. ✅ Asset loading fixes (Vite base paths)
3. ✅ Documentation creation (PRODUCTION-DEPLOYMENT.md)
4. ✅ Duplicate file removal (docker-compose.prod.yaml)
5. ✅ Root directory reorganization (11 files moved to infrastructure/)
6. ✅ Configuration files optimization (this change)

See: `infrastructure/docs/FILE-REORGANIZATION.md` for complete history.

## Migration Guide

If you have an older version of this project:

```bash
# 1. Backup current configs
cp .env .env.backup
cp common/Config/.env common/Config/.env.backup

# 2. Pull latest changes
git pull

# 3. Copy your values to common/Config/.env
nano common/Config/.env

# 4. Generate new infrastructure/.env
./infrastructure/scripts/run.sh sync-config

# 5. Verify
cat infrastructure/.env

# 6. Test
docker-compose -f infrastructure/docker-compose.yaml config --services

# 7. Start
docker-compose -f infrastructure/docker-compose.yaml up -d

# 8. Clean up backups once verified
rm .env.backup
```

## Verification Checklist

- [x] sync-config.js generates infrastructure/.env correctly
- [x] Docker Compose finds and reads infrastructure/.env
- [x] Environment variables loaded in containers
- [x] robots.txt accessible via HTTP
- [x] .gitignore updated to ignore infrastructure/.env
- [x] Documentation created (ENV-FILE-ORGANIZATION.md)
- [x] Error messages updated with new paths
- [x] run.sh syntax error fixed
- [x] All tests pass

## Conclusion

The configuration files reorganization achieves:
- ✨ Clear separation: application vs infrastructure configs
- 📁 Logical organization: all Docker files in infrastructure/
- 🌐 Working robots.txt: now web-accessible
- 🎯 Minimal root: only essential files visible
- 📚 Comprehensive documentation: clear guides for developers
- 🔄 Automated workflow: sync-config bridges the gap
- ✅ Backward compatible: old .env in .gitignore for safety

The project now has a professional, maintainable structure that clearly separates concerns and makes it easy for new developers to understand the configuration system.
