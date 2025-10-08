# Security Policy

## 🔒 Reporting a Vulnerability

The security of Proto Project is a top priority. We appreciate your efforts to responsibly disclose any security vulnerabilities you discover.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**📧 j.c.durf@gmail.com**

Include the following information in your report:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Affected component(s)** (e.g., module, file path, endpoint)
- **Steps to reproduce** the vulnerability
- **Proof of concept** or exploit code (if possible)
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within **48 hours**
2. **Assessment**: We will investigate and assess the vulnerability
3. **Updates**: We will keep you informed of our progress
4. **Resolution**: We will work on a fix and coordinate disclosure timing with you
5. **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

---

## 🛡️ Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Yes             |
| < 1.0   | ❌ No              |

---

## 🔐 Security Best Practices

### For Users/Developers

When deploying or developing with Proto Project, follow these security guidelines:

#### 1. Authentication & Authorization

- **Enable MFA** for all admin accounts
- **Use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
- **Implement rate limiting** on login endpoints (default: 1200 req/hour)
- **Review permissions regularly** using the IAM module
- **Rotate API keys** periodically

#### 2. Configuration Security

```json
// common/Config/.env - NEVER commit with real credentials
{
  "env": "prod",  // Set to 'prod' in production
  "errorReporting": false,  // Disable in production
  "errorTracking": false,   // Or use secure error service
  "database": {
    // Use strong, unique passwords
    "username": "app_user_not_root",
    "password": "CHANGE_THIS_STRONG_PASSWORD"
  }
}
```

**Critical Configuration Steps:**

- ✅ Change default database passwords
- ✅ Change default Redis password
- ✅ Set strong SMTP credentials
- ✅ Set `env` to `prod` for production
- ✅ Disable `errorReporting` in production
- ✅ Add `common/Config/.env` and `.env` to `.gitignore` (already done)
- ✅ Generate unique session secrets
- ✅ Use HTTPS in production (SSL setup included)

#### 3. Database Security

```bash
# Production database user should have minimal permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON proto.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

# Never use root credentials in application config
# Restrict database access to application network only
```

#### 4. File Upload Security

```php
// Validate file types (already configured in common/Config/.env)
"supportedFileTypes": ["jpg", "png", "pdf"]  // Whitelist only

// Additional validation in your controllers:
protected function validateUpload($file): bool
{
    // Check MIME type (don't trust extension alone)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);

    // Verify file size
    if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
        return false;
    }

    return true;
}
```

#### 5. API Security

- **CSRF Protection**: Enabled by default in Proto Framework
- **CORS Configuration**: Configure allowed origins in `public/api/index.php`
- **Rate Limiting**: Default 1200 requests/hour (configurable in `.env`)
- **Input Validation**: Always validate and sanitize user input

```php
// Example: Proper input validation
protected function validate(): array
{
    return [
        'email' => 'email|required',
        'name' => 'string:255|required',
        'age' => 'int|required'
    ];
}
```

#### 6. Docker Security

**Development:**
```bash
# Use non-root user in containers (already configured)
# Limit container resources
# Keep base images updated
```

**Production:**
```yaml
# infrastructure/docker-compose.production.yaml
services:
  web:
    # Run as non-root user
    user: "www-data:www-data"

    # Limit resources
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

    # Read-only root filesystem where possible
    read_only: false  # Application needs write access to certain dirs

    # Drop unnecessary capabilities
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

#### 7. SSL/TLS Configuration

```bash
# Use automated SSL setup (included)
./infrastructure/scripts/run.sh setup-ssl yourdomain.com your-email@domain.com

# Or use strong SSL configuration manually:
# - TLS 1.2+ only
# - Strong cipher suites
# - HSTS enabled
# - Certificate pinning (optional, for mobile apps)
```

#### 8. Dependency Management

```bash
# Regularly update dependencies
composer update
npm audit fix

# Check for known vulnerabilities
composer audit
npm audit
```

#### 9. Environment Separation

```json
// Use different credentials per environment
{
  "connections": {
    "default": {
      "dev": {
        "username": "dev_user",
        "password": "dev_password",
        "host": "localhost"
      },
      "prod": {
        "username": "prod_user",
        "password": "STRONG_PROD_PASSWORD",
        "host": "db.internal"
      }
    }
  }
}
```

#### 10. Logging & Monitoring

- **Log authentication attempts** (successes and failures)
- **Monitor for suspicious activity** (multiple failed logins, unusual access patterns)
- **Set up alerts** for critical security events
- **Rotate logs** regularly
- **Never log sensitive data** (passwords, tokens, credit cards)

```php
// Good logging practice
Log::security('Failed login attempt', [
    'ip' => $request->ip(),
    'username' => $username,
    'timestamp' => time()
]);

// Never log this:
Log::debug('User login', ['password' => $password]); // ❌ NEVER DO THIS
```

---

## 🚨 Known Security Considerations

### Default Credentials

**⚠️ CRITICAL**: The project ships with example credentials for quick setup. **You MUST change these before production deployment:**

- Database passwords in `common/Config/.env`
- Redis password
- SMTP credentials
- Any API keys

### Development vs Production

The Docker setup includes two configurations:

- `docker-compose.yaml` - Development (relaxed security for ease of use)
- `docker-compose.production.yaml` - Production (hardened configuration)

**Always use the production configuration for live deployments.**

### Self-Signed Certificates

Development includes self-signed SSL certificates for testing. **Replace with real certificates in production:**

```bash
# Use the included SSL setup script
./infrastructure/scripts/run.sh setup-ssl yourdomain.com admin@yourdomain.com
```

### File Permissions

Ensure these directories have appropriate permissions:

```bash
# Writable directories (should be 755 or 775, never 777)
chmod 755 public/files
chmod 755 common/files

# Sensitive config (readable by web server only)
chmod 640 common/Config/.env
chown www-data:www-data common/Config/.env
```

---

## 📋 Security Checklist

Before deploying to production, verify:

- [ ] All default passwords changed
- [ ] Real SSL certificates installed (not self-signed)
- [ ] `env` set to `prod` in configuration
- [ ] Error reporting disabled in production
- [ ] Database user has minimal required permissions
- [ ] Firewall configured (only ports 80, 443 exposed)
- [ ] File upload validation implemented
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Dependencies updated to latest secure versions
- [ ] Logging configured (without sensitive data)
- [ ] Backups configured and tested
- [ ] Session timeout configured
- [ ] MFA enabled for admin accounts

---

## 🔄 Security Update Process

When a security vulnerability is reported and confirmed:

1. **Assessment**: We evaluate the severity using CVSS scoring
2. **Development**: We develop and test a fix
3. **Advisory**: We prepare a security advisory
4. **Release**: We release a patch version
5. **Notification**: We notify users through:
   - GitHub Security Advisories
   - Release notes
   - Email (for critical vulnerabilities)

### Severity Levels

- **Critical**: Immediate action required (remote code execution, authentication bypass)
- **High**: Update as soon as possible (SQL injection, XSS, privilege escalation)
- **Medium**: Update in next maintenance window (information disclosure, DoS)
- **Low**: Update when convenient (minor security improvements)

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Proto Framework Security](https://github.com/protoframework/proto)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)

---

## 🙏 Hall of Thanks

We recognize and thank security researchers who responsibly disclose vulnerabilities:

<!-- Security researchers will be listed here after responsible disclosure -->

*No vulnerabilities have been reported yet.*

---

## 📞 Contact

For security-related questions or concerns:

- **Email**: j.c.durf@gmail.com
- **GitHub**: [@chrisdurfee](https://github.com/chrisdurfee)

**Thank you for helping keep Proto Project secure!** 🛡️
