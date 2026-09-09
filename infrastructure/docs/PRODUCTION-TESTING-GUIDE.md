# Production Subdomain & SSL Testing Guide

This guide provides multiple approaches to test your production container with built Vite apps running on subdomains with SSL.

## ✅ Current Status

Your Vite apps are successfully built and working:
- ✅ Main app built in `public/main/`
- ✅ CRM app built in `public/crm/`
- ✅ Developer app built in `public/developer/`
- ✅ All apps accessible via directory routing
- ✅ Health endpoint working

## Testing Approaches

### 1. Local Development Server Test (✅ Working)

Use the provided `test-production-local.sh` script:

```bash
./test-production-local.sh
```

This tests directory-based routing and verifies all apps are built correctly.

### 2. Subdomain Testing with Local DNS

To test subdomain routing locally without Docker:

#### Step 1: Update /etc/hosts
```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 myapp.local
127.0.0.1 main.myapp.local
127.0.0.1 crm.myapp.local
127.0.0.1 developer.myapp.local
```

#### Step 2: Create Apache VirtualHost Configuration
```bash
sudo nano /etc/apache2/sites-available/subdomain-test.conf
```

```apache
<VirtualHost *:80>
    ServerName myapp.local
    DocumentRoot /home/projects/proto-project/public

    # Main domain - serve main app
    RewriteEngine On
    RewriteRule ^/?$ /main/ [R=301,L]

    <Directory "/home/projects/proto-project/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    ServerName main.myapp.local
    DocumentRoot /home/projects/proto-project/public/main

    <Directory "/home/projects/proto-project/public/main">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    ServerName crm.myapp.local
    DocumentRoot /home/projects/proto-project/public/crm

    <Directory "/home/projects/proto-project/public/crm">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    ServerName developer.myapp.local
    DocumentRoot /home/projects/proto-project/public/developer

    <Directory "/home/projects/proto-project/public/developer">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Step 3: Enable Site and Test
```bash
sudo a2ensite subdomain-test
sudo systemctl reload apache2

# Test subdomains
curl -H "Host: main.myapp.local" http://localhost/
curl -H "Host: crm.myapp.local" http://localhost/
curl -H "Host: developer.myapp.local" http://localhost/
```

### 3. Docker Production Test (When Docker is Available)

When Docker is working again, use this simplified approach:

#### Create docker-compose.prod-test.yml:
```yaml
version: '3.8'

services:
  web:
    build: .
    environment:
      - APACHE_ENV=production
    volumes:
      - ./public:/var/www/html/public
      - ./infrastructure/docker/apache-subdomain.conf:/etc/apache2/sites-available/subdomain.conf
    ports:
      - "8080:80"
    command: >
      bash -c "
        a2ensite subdomain &&
        a2dissite 000-default &&
        apache2-foreground
      "
```

#### Test Commands:
```bash
# Start container
docker-compose -f docker-compose.prod-test.yml up -d

# Test subdomain routing with Host headers
curl -H "Host: main.localhost" http://localhost:8080/
curl -H "Host: crm.localhost" http://localhost:8080/
curl -H "Host: developer.localhost" http://localhost:8080/

# Check logs
docker-compose -f docker-compose.prod-test.yml logs web
```

### 4. SSL Testing with Self-Signed Certificates

#### Generate Self-Signed Certificates:
```bash
mkdir -p ssl
cd ssl

# Create CA
openssl genrsa -out ca.key 4096
openssl req -new -x509 -key ca.key -sha256 -subj "/C=US/ST=Test/O=Test/CN=Test CA" -days 365 -out ca.crt

# Create server key
openssl genrsa -out server.key 4096

# Create certificate signing request
openssl req -new -key server.key -out server.csr -config <(
cat <<EOF
[req]
default_bits = 4096
prompt = no
distinguished_name = req_distinguished_name
req_extensions = req_ext

[req_distinguished_name]
C=US
ST=Test
O=Test
CN=*.myapp.local

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = myapp.local
DNS.2 = *.myapp.local
DNS.3 = main.myapp.local
DNS.4 = crm.myapp.local
DNS.5 = developer.myapp.local
EOF
)

# Sign the certificate
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365 -extensions req_ext -extfile <(
cat <<EOF
[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = myapp.local
DNS.2 = *.myapp.local
DNS.3 = main.myapp.local
DNS.4 = crm.myapp.local
DNS.5 = developer.myapp.local
EOF
)

cd ..
```

#### Update Apache for HTTPS:
```apache
<VirtualHost *:443>
    ServerName main.myapp.local
    DocumentRoot /home/projects/proto-project/public/main

    SSLEngine on
    SSLCertificateFile /home/projects/proto-project/ssl/server.crt
    SSLCertificateKeyFile /home/projects/proto-project/ssl/server.key

    <Directory "/home/projects/proto-project/public/main">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## Production Deployment Checklist

### Before Deploying:
- [ ] All Vite apps built successfully
- [ ] Health endpoint returns 200
- [ ] Apps accessible via directory routing
- [ ] Apache subdomain configuration tested
- [ ] SSL certificates configured
- [ ] Environment variables set correctly

### Testing Commands:
```bash
# Test builds exist
ls -la public/main/ public/crm/ public/developer/

# Test health endpoint
curl http://your-domain.com/health.php

# Test subdomains with SSL
curl -k https://main.your-domain.com/
curl -k https://crm.your-domain.com/
curl -k https://developer.your-domain.com/

# Check SSL certificate
openssl s_client -connect main.your-domain.com:443 -servername main.your-domain.com
```

## Troubleshooting

### Common Issues:
1. **Apps not found**: Check that Vite build output is in correct directory
2. **Subdomain routing fails**: Verify Apache VirtualHost configuration
3. **SSL errors**: Check certificate validity and paths
4. **Docker freezing**: Use local testing approach first

### Debugging Commands:
```bash
# Check Apache configuration
apache2ctl configtest

# Check what sites are enabled
a2ensite -l

# Check Apache logs
tail -f /var/log/apache2/error.log

# Test DNS resolution
nslookup main.your-domain.com
```

This comprehensive guide should help you test your production setup thoroughly once Docker is working again.