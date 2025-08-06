# SSL Certificate Setup Guide

This guide explains how to set up SSL certificates for your Proto Project using Let's Encrypt (Option A - Recommended).

## Overview

The Proto Project includes automated SSL certificate setup using Let's Encrypt, which provides:
- ✅ **Free SSL certificates** for all subdomains
- ✅ **Automatic renewal** scripts
- ✅ **Production-ready** Apache configuration
- ✅ **Zero-downtime** certificate updates

## Prerequisites

Before setting up SSL certificates:

1. **Domain Configuration**: Update your domain in `common/Config/.env`
2. **DNS Setup**: Ensure your domain points to your server
3. **Docker**: Have Docker and Docker Compose installed
4. **Port 80**: Ensure port 80 is available for ACME challenge

## Quick SSL Setup

### Automated Script (Recommended)

**Linux/macOS:**
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh yourdomain.com your-email@yourdomain.com
```

**Windows:**
```cmd
setup-ssl.bat yourdomain.com your-email@yourdomain.com
```

### What the Script Does

1. **Creates directories** for certificates and private keys
2. **Starts temporary web server** for ACME challenge
3. **Requests staging certificates** first (for testing)
4. **Requests production certificates** after staging success
5. **Copies certificates** to Apache-expected locations
6. **Sets proper permissions** on certificate files
7. **Creates renewal script** for automatic updates
8. **Cleans up** temporary files

## Manual SSL Setup

If you prefer manual setup or need to customize:

### 1. Prepare Environment

```bash
# Create certificate directories
mkdir -p certs private certbot-webroot

# Set domain name
export DOMAIN_NAME="yourdomain.com"
export EMAIL="your-email@yourdomain.com"
```

### 2. Request Certificates

```bash
# Using Certbot directly
docker run --rm \
  -v $(pwd)/certs:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d api.$DOMAIN_NAME \
  -d app.$DOMAIN_NAME \
  -d crm.$DOMAIN_NAME \
  -d dev.$DOMAIN_NAME
```

### 3. Copy Certificates

```bash
# Copy to Apache locations
cp certs/live/$DOMAIN_NAME/fullchain.pem certs/$DOMAIN_NAME.crt
cp certs/live/$DOMAIN_NAME/privkey.pem private/$DOMAIN_NAME.key

# Set permissions
chmod 644 certs/$DOMAIN_NAME.crt
chmod 600 private/$DOMAIN_NAME.key
```

## Certificate Files Structure

After successful setup, you'll have:

```
proto-project/
├── certs/
│   ├── yourdomain.com.crt        # SSL certificate
│   └── live/                     # Let's Encrypt raw files
│       └── yourdomain.com/
│           ├── fullchain.pem
│           ├── privkey.pem
│           └── ...
├── private/
│   └── yourdomain.com.key        # Private key
└── renew-certificates.sh         # Renewal script
```

## Production Deployment

### 1. Update Domain Configuration

Edit `common/Config/.env`:
```json
{
  "domain": {
    "production": "yourdomain.com",  // ← Your actual domain
    "ssl": true,                     // ← Enable SSL
    // ... rest of config
  }
}
```

### 2. Deploy with SSL

```bash
# Start production containers with SSL support
docker-compose -f docker-compose.prod.yaml up -d
```

### 3. Verify SSL

Test your SSL setup:
```bash
# Check API
curl -I https://api.yourdomain.com/api/auth/csrf-token

# Check apps
curl -I https://app.yourdomain.com/
curl -I https://crm.yourdomain.com/
curl -I https://dev.yourdomain.com/
```

## Certificate Renewal

### Automatic Renewal

The setup script creates a renewal script:

**Linux/macOS:**
```bash
# Run renewal script (add to cron for automation)
./renew-certificates.sh

# Add to crontab for monthly renewal
crontab -e
# Add this line:
0 0 1 * * /path/to/your/project/renew-certificates.sh
```

**Windows:**
```cmd
# Run renewal script
renew-certificates.bat

# Add to Windows Task Scheduler for monthly renewal
```

### Manual Renewal

```bash
# Renew certificates manually
docker run --rm \
  -v $(pwd)/certs:/etc/letsencrypt \
  -v $(pwd)/certbot-webroot:/var/www/certbot \
  certbot/certbot renew

# Copy renewed certificates
cp certs/live/$DOMAIN_NAME/fullchain.pem certs/$DOMAIN_NAME.crt
cp certs/live/$DOMAIN_NAME/privkey.pem private/$DOMAIN_NAME.key

# Restart web server
docker-compose -f docker-compose.prod.yaml restart web
```

## Troubleshooting

### Common Issues

**1. Port 80 in use:**
```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# Stop conflicting services
sudo systemctl stop apache2  # or nginx, etc.
```

**2. DNS not propagated:**
```bash
# Check DNS propagation
dig api.yourdomain.com
nslookup app.yourdomain.com
```

**3. ACME challenge fails:**
```bash
# Ensure domain points to your server
curl -I http://api.yourdomain.com/.well-known/acme-challenge/test

# Check firewall
sudo ufw status
```

**4. Certificate permissions:**
```bash
# Fix certificate permissions
sudo chown $USER:$USER certs/* private/*
chmod 644 certs/*.crt
chmod 600 private/*.key
```

### Testing SSL

**Check certificate details:**
```bash
# Check certificate expiration
openssl x509 -in certs/yourdomain.com.crt -text -noout

# Test SSL connection
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

**Browser testing:**
- Visit `https://api.yourdomain.com/api/auth/csrf-token`
- Check for green lock icon
- Verify certificate details in browser

## Security Best Practices

### File Permissions
```bash
# Certificate files should be readable by web server only
chmod 644 certs/*.crt
chmod 600 private/*.key
sudo chown root:www-data certs/* private/*
```

### Apache Security Headers
The production Apache configuration includes:
- HTTPS redirect for HTTP requests
- Security headers (HSTS, X-Frame-Options, etc.)
- CORS configuration for subdomain access

### Certificate Monitoring
```bash
# Monitor certificate expiration
openssl x509 -in certs/yourdomain.com.crt -checkend 604800
# Exit code 0 = valid for 7+ days, 1 = expires within 7 days
```

## Advanced Options

### Wildcard Certificates

For wildcard certificates (*.yourdomain.com):
```bash
# Request wildcard certificate (requires DNS challenge)
docker run --rm \
  -v $(pwd)/certs:/etc/letsencrypt \
  certbot/certbot certonly \
  --manual \
  --preferred-challenges dns \
  --email $EMAIL \
  --agree-tos \
  -d "*.yourdomain.com" \
  -d "yourdomain.com"
```

### Custom Certificate Authority

If using custom CA certificates:
```bash
# Place your certificates
cp your-cert.crt certs/yourdomain.com.crt
cp your-key.key private/yourdomain.com.key

# Include intermediate certificates if needed
cat your-cert.crt intermediate.crt > certs/yourdomain.com.crt
```

---

This SSL setup provides production-ready HTTPS for all your subdomains with automatic renewal and proper security configuration!
