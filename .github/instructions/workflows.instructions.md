---
description: "Use for environment setup, running services via Docker Compose, running the migration runner, scaffolding via the Generator (/api/developer/generator), running the Vite dev server, executing PHPUnit tests, working with file storage / Vault uploads, debugging via the proto_error_log database table, and looking up key file locations and host port mappings"
---

# Critical Workflows

## Setup
1. Copy `common/Config/.env-example` → `common/Config/.env`
2. Run `./infrastructure/scripts/run.sh sync-config` (generates root `.env` for Docker)

## Run Services
```bash
docker-compose -f infrastructure/docker-compose.yaml up -d
```
- **Logs**: `docker-compose -f infrastructure/docker-compose.yaml logs -f web`
- **Shell**: `docker-compose -f infrastructure/docker-compose.yaml exec web bash`

## Migrations
- **Auto-run**: Enabled by default (`AUTO_MIGRATE=true`). Disable for production with `AUTO_MIGRATE=false`.
- **Manual**: `docker-compose -f infrastructure/docker-compose.yaml exec web php infrastructure/scripts/run-migrations.php`
- Discovered recursively from `modules/*/Migrations` up to 6 levels deep.

## Generator (Developer Tooling)
- **Endpoint**: `/api/developer/generator`
- **Controller**: `Modules\Developer\Controllers\GeneratorController`
- Scaffold modules, models, apis, controllers, policies, storage, migrations, gateways, and tests with consistent structure.

```bash
# Module only
curl -X POST "https://localhost:8443/api/developer/generator" \
 -H "Content-Type: application/x-www-form-urlencoded" \
 --data-urlencode 'type=module' \
 --data-urlencode 'resource={"type":"module","module":{"name":"Test"},"model":{"fields":""}}'

# Full resource
curl -X POST "https://localhost:8443/api/developer/generator" \
 -H "Content-Type: application/x-www-form-urlencoded" \
 --data-urlencode 'type=resource' \
 --data-urlencode 'resource={"type":"full-resource","moduleName":"Test","storage":{"connection":"default","extends":"Storage"},"model":{"extends":"Model","storage":false,"className":"Test","tableName":"tests","alias":"t","fields":"id"},"controller":{"extends":"Controller"},"namespace":""}'
```

## Frontend Development
- Navigate to app: `cd apps/{crm,developer,main}`
- Install: `npm install`
- Dev server: `npm run dev` (ports 3000/3001/3002; `/api` proxied to container at 8080)
- ALWAYS use relative paths in code (`/api/...`) — Vite proxy handles host

## Testing
- **Run all**: `php vendor/bin/phpunit`
- **Suite**: `php vendor/bin/phpunit --testsuite Feature`
- **Filter**: `php vendor/bin/phpunit --filter TestName`
- **Readable output**: `php vendor/bin/phpunit --testdox`
- Tests auto-wrap in transactions; changes rollback automatically.
- For factory/seeder/eager-join testing patterns, see `testing-backend.instructions.md`.

## File Storage (Vault)
- **Location**: `Proto\Utils\Files\Vault`
- **Config**: `common/Config/.env` under `"files"` key
- **Drivers**: `local`, `s3`

### Configuration Example
```json
"files": {
    "local": {
        "path": "/common/files/",
        "attachments": { "path": "/common/files/attachments/" }
    },
    "amazon": {
        "s3": {
            "bucket": {
                "uploads": { "secure": true, "name": "main", "path": "main/", "region": "", "version": "latest" }
            }
        }
    }
}
```

### File Upload (CRITICAL: use Request, NOT $_FILES)
```php
use Proto\Http\Router\Request;
use Proto\Http\UploadFile;

// Single file upload
$avatar = $request->file('avatar'); // UploadFile|null

// Multiple files (array upload like attachments[])
$attachments = $request->fileArray('attachments'); // UploadFile[]

// All uploaded files
$allFiles = $request->files();
```

### Validation
```php
$rules = ['avatar' => 'image:2048|required|mimes:jpeg,png,gif,bmp,tiff,webp,jxl,heic,heif,avif'];
$this->validateRules($data, $rules);

// Or single-file validation
$avatar = $request->validateFile('avatar', $rules);

// Or file array
$attachments = $request->validateFileArray('attachments', $rules);
```

### Controller Helpers (Preferred)
ResourceController provides built-in helpers:
```php
// Single file — returns new filename or null
$data->coverImage = $this->handleFileUpload($request, 'coverImage', 'local', 'vehicles',
    'image:2048|mimes:jpeg,png,gif,bmp,tiff,webp,jxl,heic,heif,avif') ?? $data->coverImage;

// Batch upload — returns array of metadata objects
$media = $this->handleMediaUpload($request, 'media', 'local', 'forum', 'image:5120');
if (!empty($media))
{
    $data->media = json_encode($media);
}
```

### Storage Operations
```php
use Proto\Utils\Files\Vault;

// In controller — store uploaded file
$uploadFile = $request->file('upload');
$uploadFile->store('local', 'attachments');

// File metadata
$originalName = $uploadFile->getOriginalName();
$newName = $uploadFile->getNewName();
$size = $uploadFile->getSize();
$mimeType = $uploadFile->getMimeType();

// Image-specific
if ($uploadFile->isImageFile())
{
    [$width, $height] = $uploadFile->getDimensions();
}

// Via Vault directly
Vault::disk('local', 'attachments')->add('/tmp/file.txt');
Vault::disk('local', 'attachments')->download('file.txt');
$content = Vault::disk('local')->get('/tmp/file.txt');
Vault::disk('local')->delete('/tmp/file.txt');
Vault::disk('s3', 'uploads')->add('/tmp/file.txt');
```

**Supported image MIME types**: jpeg, jpg, png, gif, webp, bmp, tiff, jxl, heic, heif, avif

## Debugging

### Backend Error Log (CHECK FIRST)
Proto automatically logs all backend errors to the `proto_error_log` database table. Query this BEFORE inspecting code or logs:

```sql
-- Recent errors
SELECT * FROM proto_error_log ORDER BY added DESC LIMIT 20;

-- Filter by URL
SELECT * FROM proto_error_log WHERE url LIKE '%/api/vehicle%' ORDER BY added DESC;

-- Filter by date
SELECT * FROM proto_error_log WHERE added >= '2026-03-23' ORDER BY added DESC;
```

Contains: error message, file, line number, stack trace, URL, IP, timestamp.

### Common Issues
- **Docker / vendor missing**: Container runs `composer install` automatically. Check `docker-compose logs -f web`.
- **CORS errors**: Update `cors.allowedOrigins` in `common/Config/.env`, then `./infrastructure/scripts/run.sh sync-config`.
- **Frontend API**: Always use relative paths `/api/...` — DON'T hardcode domains.

## Key Files & Ports
- Backend boot: `public/api/index.php`
- Docker config: `infrastructure/docker-compose.yaml`
- Migrations runner: `infrastructure/scripts/run-migrations.php`
- Frontend proxy: `apps/*/vite.config.js`
- Domain config: `infrastructure/config/domain.config.js`
- Config flow: `common/Config/.env` (JSON) → `infrastructure/scripts/sync-config.js` → root `.env`
- **MariaDB**: host port 3307 → container port 3306
- **Redis**: host port 6380 → container port 6379
- **Vite dev**: ports 3000 (crm) / 3001 (developer) / 3002 (main)
