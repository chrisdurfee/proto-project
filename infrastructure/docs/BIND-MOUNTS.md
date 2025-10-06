# Bind Mount Strategy

This document explains how Proto Project handles bind mounts for seamless development across different installation scenarios.

## Overview

Proto Project uses a **hybrid approach** that combines:
- **Built-in files** in the Docker image (production-ready)
- **Bind mount overlays** for development (live editing)
- **Automatic dependency detection** (handles missing vendor/)

This ensures the project works for:
- ✅ Fresh `composer create-project` installations
- ✅ Git clones
- ✅ Existing development environments
- ✅ Production deployments

---

## How It Works

### 1. Build Time (Dockerfile)

During `docker-compose build`, the Dockerfile:

```dockerfile
# Copy all application code into the image
COPY modules/ ./modules/
COPY common/ ./common/
COPY public/ ./public/

# Install dependencies
RUN composer install --no-scripts --no-autoloader --no-dev

# Generate autoloader
RUN composer dump-autoload --optimize --no-dev
```

**Result**: The Docker image contains a complete, working application.

### 2. Runtime (docker-compose.yaml)

When containers start, bind mounts **overlay** the built-in files:

```yaml
volumes:
  # Development bind mounts
  - ./common:/var/www/html/common:rw
  - ./modules:/var/www/html/modules:rw
  - ./public:/var/www/html/public:rw
  - ./apps:/var/www/html/apps:rw
```

**Result**: Host files take precedence, enabling live editing.

### 3. Startup (entrypoint.sh)

The entrypoint automatically handles missing dependencies:

```bash
# Wait for bind mounts to appear
if [ ! -f "vendor/autoload.php" ]; then
    if [ -f "composer.json" ]; then
        echo "❌ Autoloader not found; running composer install..."
        composer install --no-interaction --no-dev --optimize-autoloader
    fi
fi
```

**Result**: Ensures `vendor/` exists before running the application.

---

## Installation Scenarios

### Scenario 1: Fresh `composer create-project`

```bash
composer create-project protoframework/proto-project my-app
cd my-app
cp common/Config/.env-example common/Config/.env
./run.sh sync-config
docker-compose up -d
```

**What happens:**
1. Composer downloads package (no `vendor/` in source)
2. `docker-compose build` runs, copies files, installs dependencies in image
3. Container starts with bind mounts overlaying the image
4. Entrypoint detects missing `vendor/` on host → runs `composer install`
5. Application starts successfully ✅

### Scenario 2: Git Clone

```bash
git clone https://github.com/protoframework/proto-project.git my-app
cd my-app
composer install  # (optional - can let Docker handle it)
cp common/Config/.env-example common/Config/.env
./run.sh sync-config
docker-compose up -d
```

**What happens:**
1. Git clone includes all source files
2. If user ran `composer install` → `vendor/` exists → entrypoint skips install
3. If user skipped it → entrypoint runs `composer install` automatically
4. Application starts successfully ✅

### Scenario 3: Existing Development Environment

```bash
cd existing-proto-project
docker-compose up -d
```

**What happens:**
1. Bind mounts use existing host files (including `vendor/`)
2. Entrypoint detects `vendor/autoload.php` exists → skips install
3. Application starts immediately ✅

### Scenario 4: Production Deployment

```bash
# Production doesn't use bind mounts
docker-compose -f docker-compose.production.yaml up -d
```

**What happens:**
1. Uses built-in files from image (no bind mounts)
2. `vendor/` exists from build → entrypoint skips install
3. Application runs from immutable image ✅

---

## Key Design Decisions

### Why Copy Files During Build?

**Reason**: Creates a self-contained, production-ready image.

Without this, the image would be empty and completely dependent on bind mounts, making production deployment impossible.

### Why Use Bind Mounts in Development?

**Reason**: Enables live code editing without rebuilding the image.

Changes to PHP files, templates, or configurations appear immediately without restarting containers.

### Why Auto-Install Dependencies?

**Reason**: Handles the case where `composer create-project` doesn't include `vendor/`.

The entrypoint ensures dependencies are always present, regardless of how the project was installed.

### Why Not Use Named Volumes for vendor/?

**Reason**: Vendor contents can change based on:
- `composer.json` updates
- PHP version changes
- Development vs production environments

Bind mounting allows developers to run `composer install` on the host for IDE integration, or let the container handle it automatically.

---

## Troubleshooting

### Issue: "Autoloader not found" on every restart

**Cause**: `vendor/` is missing on the host.

**Solution**: Let the container install it, or run on host:
```bash
composer install
```

### Issue: Changes to composer.json not taking effect

**Cause**: Need to regenerate autoloader.

**Solution**:
```bash
docker-compose exec web composer install
# OR
docker-compose restart web
```

### Issue: Bind mount not showing latest files

**Cause**: Caching or old container.

**Solution**:
```bash
docker-compose down
docker-compose up -d
```

### Issue: Production image missing files

**Cause**: Files not copied during build.

**Solution**: Ensure Dockerfile has:
```dockerfile
COPY modules/ ./modules/
COPY common/ ./common/
# ... etc
```

---

## Best Practices

### For Development

1. **Let Docker handle dependencies initially**:
   ```bash
   docker-compose up -d
   # Wait for entrypoint to install vendor/
   ```

2. **For IDE integration, install locally**:
   ```bash
   composer install
   # Now your IDE can autocomplete
   ```

3. **Keep common/Config/.env in sync**:
   ```bash
   ./run.sh sync-config
   docker-compose restart web
   ```

### For Production

1. **Use dedicated production compose file**:
   ```bash
   docker-compose -f docker-compose.production.yaml up -d
   ```

2. **Build optimized image**:
   ```dockerfile
   RUN composer install --no-dev --optimize-autoloader
   ```

3. **Don't use bind mounts** (remove from production compose)

### For New Installations

1. **Document the quick start**:
   ```bash
   composer create-project protoframework/proto-project my-app
   cd my-app
   cp common/Config/.env-example common/Config/.env
   ./run.sh sync-config
   docker-compose up -d  # Everything else is automatic!
   ```

2. **First build takes longer** (~2-3 minutes)
   - Subsequent starts are instant

3. **Migrations run automatically** by default
   - Disable with `AUTO_MIGRATE=false` if needed

---

## Migration from Other Setups

### From Local PHP to Docker

1. Keep your existing `vendor/` directory
2. Start Docker containers
3. Bind mounts will use your local files
4. No changes needed! ✅

### From Docker Without Bind Mounts

1. Add bind mounts to `docker-compose.yaml`
2. Rebuild image: `docker-compose build`
3. Restart: `docker-compose up -d`
4. Files are now editable on host ✅

### From Full Bind Mount (including vendor/)

1. Current setup is optimal! ✅
2. You have live editing + automatic dependency management
3. Works for fresh installs and existing projects

---

## Summary

The bind mount strategy provides:

✅ **Self-contained images** (production-ready)
✅ **Live code editing** (development-friendly)
✅ **Automatic dependency management** (beginner-friendly)
✅ **Flexible installation** (works for any scenario)
✅ **IDE integration** (optional local vendor/)

This approach balances convenience, performance, and production readiness without requiring users to understand Docker internals.
