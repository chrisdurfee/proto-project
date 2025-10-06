# Quick HTTPS Reference

## Access URLs
- **HTTP**: http://localhost:8080
- **HTTPS**: https://localhost:8443

## Quick Tests
```bash
# Test HTTP
curl http://localhost:8080/api/user

# Test HTTPS (ignore self-signed cert)
curl -k https://localhost:8443/api/user

# View SSL certificate
openssl s_client -connect localhost:8443 -showcerts </dev/null 2>/dev/null | openssl x509 -noout -text

# Check security headers
curl -skI https://localhost:8443/
```

## Browser Access
1. Navigate to `https://localhost:8443`
2. Click **"Advanced"** when warned about self-signed certificate
3. Click **"Proceed to localhost"** or **"Accept Risk"**

## What's Configured
✅ SSL/TLS encryption
✅ Self-signed certificate (365 days)
✅ Modern security headers (HSTS, CSP, X-Frame-Options)
✅ HTTP/2 support (partial - static assets only due to mod_php)
✅ Port 8443 for HTTPS
✅ Port 8080 for HTTP

## For Full Documentation
See: `infrastructure/docs/HTTPS-SETUP.md`
