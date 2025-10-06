# HTTPS and HTTP/2 Configuration

## Overview
The Proto Project Docker container is configured with **HTTPS support** using a self-signed SSL certificate for local development. HTTP/2 is partially supported with the current configuration.

## Accessing Your Application

### HTTP (Standard)
```
http://localhost:8080
```

### HTTPS (Secure)
```
https://localhost:8443
```

## Certificate Details

### Self-Signed Certificate
The container automatically generates a self-signed SSL certificate during build with the following details:

- **Organization**: Proto Development
- **Common Name**: localhost
- **Subject Alternative Names**:
  - DNS: localhost
  - DNS: *.localhost
  - IP: 127.0.0.1
- **Validity**: 365 days
- **Key**: RSA 2048-bit

### Certificate Locations
- **Certificate**: `/etc/ssl/certs/localhost.crt`
- **Private Key**: `/etc/ssl/private/localhost.key`

## Browser Setup

### Accepting Self-Signed Certificates

**Chrome/Edge:**
1. Navigate to `https://localhost:8443`
2. Click "Advanced" when you see the warning
3. Click "Proceed to localhost (unsafe)"
4. Your browser will remember this exception

**Firefox:**
1. Navigate to `https://localhost:8443`
2. Click "Advanced"
3. Click "Accept the Risk and Continue"

**Safari:**
1. Navigate to `https://localhost:8443`
2. Click "Show Details"
3. Click "visit this website"
4. Click "Visit Website" to confirm

### Installing Certificate (Optional - Recommended for Development)

**macOS:**
```bash
# Export certificate from container
docker-compose exec web cat /etc/ssl/certs/localhost.crt > localhost.crt

# Add to keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain localhost.crt
```

**Windows:**
```powershell
# Export certificate from container
docker-compose exec web cat /etc/ssl/certs/localhost.crt > localhost.crt

# Import to Trusted Root CA
certutil -addstore -f "ROOT" localhost.crt
```

**Linux:**
```bash
# Export certificate from container
docker-compose exec web cat /etc/ssl/certs/localhost.crt > localhost.crt

# Copy to system certificates
sudo cp localhost.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

## HTTP/2 Support

### Current Status
✅ **HTTPS enabled** with self-signed certificate
✅ **SSL/TLS configured** with modern security
⚠️ **HTTP/2 partially supported** due to MPM compatibility

### Why Limited HTTP/2?

The `php:apache` Docker image uses **Apache with mod_php**, which requires the **prefork MPM**. HTTP/2 requires the **event** or **worker** MPM for full functionality.

**Current behavior:**
- HTTP/2 works for **static assets** (CSS, JS, images)
- PHP requests may fall back to **HTTP/1.1** (Apache warning visible in logs)
- This is **normal and acceptable** for development

### To Enable Full HTTP/2 (Advanced)

For production or advanced users who want full HTTP/2 support, you need to switch to **PHP-FPM**:

1. **Replace** `php:apache` base image with `php:fpm-apache`
2. **Configure** Apache with event MPM + mod_proxy_fcgi
3. **Update** Docker compose to run PHP-FPM separately

This is beyond the scope of typical development and not required for most use cases.

## Security Headers

The SSL virtual host includes modern security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: [configured for development]
```

## Testing HTTPS

### Basic Test
```bash
# HTTP
curl http://localhost:8080/api/user

# HTTPS (ignore self-signed cert)
curl -k https://localhost:8443/api/user
```

### Check SSL Certificate
```bash
# View certificate details
openssl s_client -connect localhost:8443 -showcerts < /dev/null

# Check certificate expiry
echo | openssl s_client -connect localhost:8443 2>/dev/null | openssl x509 -noout -dates
```

### Check HTTP/2 Support
```bash
# Using curl (HTTP/2 if available)
curl -I --http2 -k https://localhost:8443/

# Using Chrome DevTools
# 1. Open https://localhost:8443
# 2. DevTools → Network tab
# 3. Right-click columns → Enable "Protocol"
# 4. Reload page and check protocol column
```

## Frontend Vite Configuration

Update your Vite apps to support HTTPS in development:

```javascript
// apps/main/vite.config.js (example)
export default defineConfig({
  server: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    },
    proxy: {
      '/api': {
        target: 'https://localhost:8443',  // Use HTTPS backend
        changeOrigin: true,
        secure: false,  // Allow self-signed cert
      },
    },
  },
});
```

## Production Considerations

### DO NOT USE SELF-SIGNED CERTIFICATES IN PRODUCTION

For production, use **Let's Encrypt** or a commercial certificate:

1. **Let's Encrypt (Recommended - Free):**
   ```bash
   # Use Certbot
   certbot certonly --webroot -w /var/www/html/public -d yourdomain.com
   ```

2. **Commercial Certificate:**
   - Purchase from a trusted CA (DigiCert, Sectigo, etc.)
   - Follow CA's installation instructions

3. **Update Apache Configuration:**
   ```apache
   SSLCertificateFile /path/to/your/certificate.crt
   SSLCertificateKeyFile /path/to/your/private.key
   SSLCertificateChainFile /path/to/chain.crt  # If applicable
   ```

## Troubleshooting

### "Your connection is not private" Error
This is **expected** with self-signed certificates. Click "Advanced" and proceed, or install the certificate in your system's trust store.

### Port 8443 Already in Use
```bash
# Check what's using port 8443
sudo lsof -i :8443

# Or change the port in docker-compose.yaml
ports:
  - "9443:443"  # Use different host port
```

### Apache HTTP/2 Warning in Logs
```
[http2:warn] AH10034: The mpm module (prefork.c) is not supported by mod_http2
```
This is **normal and expected** with mod_php. HTTP/2 will work for static assets but may fall back to HTTP/1.1 for PHP. This doesn't affect functionality.

### HSTS Causing Issues
If you need to reset HSTS in your browser:

**Chrome:**
1. Navigate to `chrome://net-internals/#hsts`
2. Enter `localhost` in "Delete domain security policies"
3. Click "Delete"

**Firefox:**
1. Navigate to `about:permissions`
2. Find localhost
3. Clear HTTPS-only settings

## File Locations

- **Dockerfile**: SSL certificate generation
- **docker-compose.yaml**: Port 8443 exposure
- **infrastructure/docker/apache-ssl-vhost.conf**: HTTPS virtual host
- **infrastructure/docker/apache-vhost.conf**: HTTP virtual host

## Summary

✅ **HTTPS ready** for local development
✅ **Modern SSL/TLS** configuration
✅ **Security headers** configured
⚠️ **HTTP/2** works for static assets (mod_php limitation)
❌ **NOT for production** without proper certificates

Your development environment now supports secure HTTPS connections at `https://localhost:8443`! 🔒
