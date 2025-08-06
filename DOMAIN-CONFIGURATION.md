# Domain Configuration Guide

This guide explains how the centralized domain configuration system works and how to maintain it.

## Overview

The Proto Project uses a **hybrid domain configuration system** that:

1. **Automatically reads** from your Proto framework configuration (`common/Config/.env`)
2. **Falls back** to static defaults if the config can't be read
3. **Adapts URLs** based on development vs production environment
4. **Centralizes** all domain settings in one place

## How It Works

### Configuration File: `domain.config.js`

This file contains the logic for loading and managing domain configuration:

```javascript
// Tries to load from common/Config/.env first
const DOMAIN_CONFIG = loadProtoConfig();

// Falls back to static defaults if needed
const DEFAULT_CONFIG = {
    production: 'yourdomain.com',
    development: 'localhost',
    // ... other settings
};

// Generates URLs based on environment
function generateUrls(isDev = false) {
    // Returns appropriate URLs for dev/prod
}
```

### Proto Configuration: `common/Config/.env`

Your actual domain settings are stored here:

```json
{
  "domain": {
    "production": "yourdomain.com",
    "development": "localhost",
    "subdomains": {
      "api": "api",
      "main": "app",
      "crm": "crm",
      "developer": "dev"
    },
    "ssl": true,
    "ports": {
      "development": {
        "api": 8080,
        "main": 3000,
        "crm": 3001,
        "developer": 3002
      }
    }
  }
}
```

## Environment-Based URL Generation

### Development URLs
When `NODE_ENV !== 'production'`:

```
API:       http://localhost:8080
Main:      http://localhost:3000
CRM:       http://localhost:3001
Developer: http://localhost:3002
```

### Production URLs
When `NODE_ENV === 'production'`:

```
API:       https://api.yourdomain.com
Main:      https://app.yourdomain.com
CRM:       https://crm.yourdomain.com
Developer: https://dev.yourdomain.com
```

## Configuration Options

### Domain Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `production` | Your production domain (without protocol) | `"yourdomain.com"` |
| `development` | Development base domain | `"localhost"` |
| `subdomains.api` | API subdomain prefix | `"api"` → `api.yourdomain.com` |
| `subdomains.main` | Main app subdomain prefix | `"app"` → `app.yourdomain.com` |
| `subdomains.crm` | CRM subdomain prefix | `"crm"` → `crm.yourdomain.com` |
| `subdomains.developer` | Developer tools subdomain prefix | `"dev"` → `dev.yourdomain.com` |
| `ssl` | Enable HTTPS in production | `true` or `false` |

### Development Ports

| Port | Service | Description |
|------|---------|-------------|
| `8080` | API Server | Backend PHP API (containerized) |
| `3000` | Main App | Main application Vite dev server |
| `3001` | CRM App | CRM interface Vite dev server |
| `3002` | Developer App | Developer tools Vite dev server |

## Usage in Applications

### Vite Configurations

All Vite configs automatically import and use the domain configuration:

```javascript
// apps/*/vite.config.js
import { generateUrls } from '../../domain.config.js';

const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api; // Automatically correct for environment
```

### Build Scripts

Build scripts can import the configuration to generate correct URLs:

```javascript
import { DOMAIN_CONFIG, generateUrls } from './domain.config.js';

const prodUrls = generateUrls(false); // Production URLs
const devUrls = generateUrls(true);   // Development URLs
```

## Maintenance Tasks

### Changing Your Domain

1. **Edit Proto Configuration**:
   ```json
   // In common/Config/.env
   {
     "domain": {
       "production": "mynewdomain.com", // ← Change this
       // ... rest of config stays the same
     }
   }
   ```

2. **All apps automatically use new domain** - no code changes needed!

### Adding New Subdomains

1. **Add to Proto Configuration**:
   ```json
   {
     "domain": {
       "subdomains": {
         "api": "api",
         "main": "app",
         "crm": "crm",
         "developer": "dev",
         "admin": "admin" // ← New subdomain
       }
     }
   }
   ```

2. **Update domain.config.js** to include the new subdomain:
   ```javascript
   function generateUrls(isDev = false) {
     // Add admin URL generation
     return {
       api: /* ... */,
       main: /* ... */,
       crm: /* ... */,
       developer: /* ... */,
       admin: isDev
         ? `${protocol}://${baseDomain}:3003`
         : `${protocol}://${DOMAIN_CONFIG.subdomains.admin}.${baseDomain}`
     };
   }
   ```

### Changing Development Ports

1. **Update Proto Configuration**:
   ```json
   {
     "domain": {
       "ports": {
         "development": {
           "api": 8080,
           "main": 4000, // ← Changed from 3000
           "crm": 4001,  // ← Changed from 3001
           "developer": 4002 // ← Changed from 3002
         }
       }
     }
   }
   ```

2. **Update Vite configs** if needed (usually automatic)

3. **Update docker-compose.yaml** if changing API port

### Testing Configuration

You can test the configuration by checking what URLs are generated:

```javascript
import { generateUrls } from './domain.config.js';

console.log('Development URLs:', generateUrls(true));
console.log('Production URLs:', generateUrls(false));
```

## Troubleshooting

### Configuration Not Loading

**Problem**: Domain config falls back to defaults instead of reading Proto config.

**Solutions**:
- Check that `common/Config/.env` exists and is valid JSON
- Verify the `domain` section exists in the config
- Check file permissions
- Look for JSON syntax errors

### Wrong URLs Generated

**Problem**: Apps are using incorrect URLs.

**Solutions**:
- Verify `NODE_ENV` is set correctly
- Check domain configuration in `common/Config/.env`
- Clear Vite cache: `rm -rf apps/*/node_modules/.vite`
- Restart development servers

### CORS Issues

**Problem**: Frontend can't connect to API due to CORS errors.

**Solutions**:
- Ensure API CORS settings match the generated frontend URLs
- Check that development ports match configuration
- Verify subdomain configuration for production

## Best Practices

### Development
- Keep development domain as `localhost` for simplicity
- Use standard ports (3000, 3001, 3002, 8080) to avoid conflicts
- Always test both development and production URL generation

### Production
- Use a real domain name for production configuration
- Enable SSL (`ssl: true`) for production domains
- Test subdomain DNS configuration before deployment
- Update Apache/Nginx virtual host configurations to match subdomains

### Maintenance
- Document any custom subdomain additions
- Keep fallback defaults in sync with Proto configuration
- Test configuration changes in development before deploying
- Use version control to track domain configuration changes

---

This centralized approach ensures all your applications stay in sync with domain changes and makes deployment configuration much simpler!
