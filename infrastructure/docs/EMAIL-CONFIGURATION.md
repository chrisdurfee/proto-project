# Email Configuration Management

## Overview

The Proto Project uses the enhanced Proto Framework (v1.0.15+) with native PHPMailer/SMTP support for universal email sending. You can manage all email settings from the Proto configuration system and automatically sync them to Docker.

## Framework Requirements

- **Proto Framework**: v1.0.15 or higher (includes enhanced Email class)
- **PHP**: 8.2 or higher
- **PHPMailer**: Included with Proto framework

## Configuration Methods

### Method 1: Proto Configuration (Recommended)

Edit `common/Config/.env` to configure email settings:

```json
{
  "email": {
    "smtp": {
      "host": "smtp.mailtrap.io",       // SMTP server hostname
      "port": 2525,                     // SMTP port (587 for TLS, 465 for SSL)
      "username": "your_username",      // SMTP authentication username
      "password": "your_password",      // SMTP authentication password
      "encryption": "tls",              // Encryption method: 'tls', 'ssl', or null
      "fromAddress": "noreply@yourapp.com", // Default sender email
      "fromName": "Your App Name",      // Default sender name
      "sendingEnabled": false           // Enable/disable sending (dev safety)
    }
  }
}
```

Then sync to Docker:
```bash
node sync-config.js
docker-compose restart
```

### Method 2: Direct Docker Configuration

Directly edit the root `.env` file:

```bash
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourapp.com
MAIL_FROM_NAME="Your App Name"
MAIL_SENDING_ENABLED=false
```

## SMTP Providers Configuration

### Mailtrap (Development)
```json
{
  "email": {
    "smtp": {
      "host": "smtp.mailtrap.io",
      "port": 2525,
      "username": "your_mailtrap_username",
      "password": "your_mailtrap_password",
      "encryption": "tls",
      "sendingEnabled": true
    }
  }
}
```

### SendGrid (Production)
```json
{
  "email": {
    "smtp": {
      "host": "smtp.sendgrid.net",
      "port": 587,
      "username": "apikey",
      "password": "your_sendgrid_api_key",
      "encryption": "tls",
      "sendingEnabled": true
    }
  }
}
```

### Mailgun (Production)
```json
{
  "email": {
    "smtp": {
      "host": "smtp.mailgun.org",
      "port": 587,
      "username": "postmaster@mg.yourdomain.com",
      "password": "your_mailgun_password",
      "encryption": "tls",
      "sendingEnabled": true
    }
  }
}
```

### Gmail/Google Workspace
```json
{
  "email": {
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "username": "your-email@gmail.com",
      "password": "your_app_password",
      "encryption": "tls",
      "sendingEnabled": true
    }
  }
}
```

### Amazon SES
```json
{
  "email": {
    "smtp": {
      "host": "email-smtp.us-west-2.amazonaws.com",
      "port": 587,
      "username": "your_ses_smtp_username",
      "password": "your_ses_smtp_password",
      "encryption": "tls",
      "sendingEnabled": true
    }
  }
}
```

## Environment-Specific Configuration

### Development Setup
```json
{
  "env": "dev",
  "email": {
    "smtp": {
      "host": "smtp.mailtrap.io",
      "port": 2525,
      "username": "dev_username",
      "password": "dev_password",
      "encryption": "tls",
      "fromAddress": "dev@proto-project.local",
      "fromName": "Proto Project (Dev)",
      "sendingEnabled": false  // Disabled by default for safety
    }
  }
}
```

### Production Setup
```json
{
  "env": "prod",
  "email": {
    "smtp": {
      "host": "smtp.sendgrid.net",
      "port": 587,
      "username": "apikey",
      "password": "production_api_key",
      "encryption": "tls",
      "fromAddress": "noreply@yourdomain.com",
      "fromName": "Your Production App",
      "sendingEnabled": true
    }
  }
}
```

## Usage in Code

The email settings are automatically applied using the Proto framework's enhanced Email dispatcher:

```php
use Proto\Dispatch\Email;

// Basic usage - settings automatically read from env('email')->smtp
$email = new Email(
    'user@example.com',           // To
    'html',                       // Type
    'noreply@yourapp.com',        // From (can be overridden by config)
    'Welcome!',                   // Subject
    '<h1>Welcome to our app!</h1>' // Message
);

// Send email (respects sendingEnabled setting from config)
$result = $email->send();

// For development testing, you can override the sending control
if ($_ENV['APP_ENV'] === 'development') {
    $email->setSendingEnabled(true); // Enable for this specific email
}

$result = $email->send();
```

## Troubleshooting

### Check Configuration Sync
```bash
node sync-config.js
```
This will show you exactly what email settings are being applied.

### Check Container Logs
```bash
docker-compose logs web | grep -i mail
```

### Test Email Settings
```php
// Test SMTP connection
$email = new \Proto\Dispatch\Email(
    'test@example.com',
    'text',
    'system@yourapp.com',
    'SMTP Test',
    'This is a test email to verify SMTP configuration.'
);

$email->setSendingEnabled(true);
$result = $email->send();

if ($result->success) {
    echo "Email sent successfully!";
} else {
    echo "Email failed: " . $result->message;
}
```

### Common Issues

1. **Authentication Failed**: Check username/password in SMTP settings
2. **Connection Timeout**: Verify host and port settings
3. **TLS/SSL Issues**: Ensure encryption method matches provider requirements
4. **Email Not Sending in Dev**: Check that `sendingEnabled` is set to `true`

## Security Best Practices

1. **Never commit passwords**: Use environment variables for sensitive data
2. **Use App Passwords**: For Gmail, generate app-specific passwords
3. **Rotate Credentials**: Regularly update SMTP passwords
4. **Monitor Usage**: Track email sending for abuse detection
5. **Validate Recipients**: Always validate email addresses before sending

## Migration from MailHog

If you were using MailHog before, simply:

1. Update your Proto config with real SMTP settings
2. Run `node sync-config.js`
3. Restart containers: `docker-compose restart`

The new system provides all the same testing capabilities with production-ready infrastructure.
