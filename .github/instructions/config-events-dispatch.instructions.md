---
description: "Use when working with environment configuration (common/Config/.env), CSRF rotation, trusted proxies, CORS whitelist, the Events system (local/Redis pub-sub, Storage events, SSE), or the Dispatch system (email via SMTP, SMS via Twilio, Web Push via VAPID, user module gateways)"
---

# Configuration, Events & Dispatch

## Configuration

**Location**: `common/Config/.env` (JSON format)
**Access**: `env('key')` or `env('key.nested')`
**Docker Sync**: `./infrastructure/scripts/run.sh sync-config`

### CSRF Token Rotation
Always rotate on security-sensitive transitions to prevent session fixation:
```php
csrf()->rotate(); // Call on login, logout, and privilege escalation
```

### Trusted Proxies
When running behind a load balancer, configure trusted proxies so Proto reads the correct client IP from forwarded headers:
```json
"trustedProxies": ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
```
Supports individual IPs and CIDR ranges. Common providers:
- AWS ALB/ELB: VPC CIDR (e.g., `10.0.0.0/8`)
- Cloudflare: Published IP ranges
- Docker internal: `172.16.0.0/12`

### CORS Origin Whitelist
Restrict which origins can make cross-origin requests:
```json
"cors": { "allowedOrigins": ["https://yourdomain.com", "https://app.yourdomain.com"] }
```
Only origins in this list receive CORS headers. Vite dev server origins are automatically allowed for local dev.

## Events System

Proto provides local and distributed (Redis) events.

### Basic Usage
```php
use Proto\Events\Events;

// Subscribe
Events::on('user.created', function($payload)
{
    EmailService::sendWelcome($payload->email);
});

// Publish
Events::update('user.created', (object)['id' => $userId, 'email' => $email]);

// Helper function syntax
events()->subscribe('user.created', $callback);
events()->emit('user.created', $data);
```

### Redis Events (Distributed)
Prefix event names with `redis:` to broadcast across all application instances:
```php
// Subscribe on ALL instances
Events::on('redis:cache.cleared', function($data)
{
    Logger::info('Cache cleared globally');
});

// Publish to ALL instances
Events::update('redis:cache.cleared', ['timestamp' => time()]);
```

### Storage Events
Storage layer auto-publishes events for CRUD operations:
```php
// Per-model events
Events::on('User:add', function($payload)
{
    // $payload contains: args, data
});

// Listen to ALL storage events
Events::on('Storage', function($payload)
{
    // $payload contains: target (model name), method, data
});
```

### Server-Sent Events (SSE)
For real-time streaming to clients:
```php
public function stream(Request $request): void
{
    $channel = "conversation:{$conversationId}:messages";
    redisEvent($channel, function($channel, $message): array|null
    {
        $messageId = $message['id'] ?? null;
        if (!$messageId) return null;

        $messageData = Message::get($messageId);
        return ['merge' => [$messageData], 'deleted' => []];
    });
}
```

For SSE on a `ResourceController`, prefer `SyncableTrait` (see `proto-controllers-routing.instructions.md`).

## Dispatch (Email, SMS, Push)

**Location**: `Proto\Dispatch\Dispatcher` and `Proto\Dispatch\Enqueuer`

### Email
```php
use Proto\Dispatch\Dispatcher;
use Proto\Dispatch\Enqueuer;

$settings = (object)[
    'to' => 'email@example.com',
    'subject' => 'Welcome',
    'fromName' => 'App Name',
    'template' => 'Common\\Email\\WelcomeEmail',
    'attachments' => ['/path/to/file.pdf']
];

$data = (object)['name' => 'John'];

// Send immediately
Dispatcher::email($settings, $data);

// Enqueue for later
Enqueuer::email($settings, $data);

// Or use queue flag
$settings->queue = true;
Dispatcher::email($settings, $data);
```

### SMS (Twilio)
```php
$settings = (object)[
    'to' => '1112221111',
    'template' => 'Common\\Text\\NotificationSms'
];

Dispatcher::sms($settings, $data);
Enqueuer::sms($settings, $data);
```

### Web Push (VAPID)
```php
$settings = (object)[
    'subscriptions' => [
        ['endpoint' => 'https://...', 'keys' => ['auth' => '...', 'p256dh' => '...']]
    ],
    'template' => 'Common\\Push\\NotificationPush'
];

Dispatcher::push($settings, $data);
```

### User Module Gateways (Recommended)
For user-targeted notifications, prefer the gateway helpers — they resolve the user's email/phone/subscriptions automatically:
```php
// Email
modules()->user()->email()->sendById($userId, $settings, $data);
modules()->user()->email()->send($user, $settings, $data);

// SMS
modules()->user()->sms()->sendById($userId, $settings, $data);

// Push
modules()->user()->push()->send($userId, $settings, $data);
```

## Integration Points
- **Database**: MariaDB (host port 3307, container port 3306)
- **Cache**: Redis (host port 6380, container port 6379)
- **Email**: SMTP settings from `common/Config/.env`
- **Frontend**: Vite proxies `/api` to backend container at port 8080
