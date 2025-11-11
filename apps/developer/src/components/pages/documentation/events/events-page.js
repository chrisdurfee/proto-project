import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { DocPage } from "../../types/doc/doc-page.js";

/**
 * CodeBlock
 *
 * Creates a code block with copy-to-clipboard functionality.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const CodeBlock = Atom((props, children) => (
	Pre(
		{
			...props,
			class: `flex p-4 max-h-[650px] max-w-[1024px] overflow-x-auto
					 rounded-lg border bg-muted whitespace-break-spaces
					 break-all cursor-pointer mt-4 ${props.class}`
		},
		[
			Code(
				{
					class: 'font-mono flex-auto text-sm text-wrap',
					click: () => {
						navigator.clipboard.writeText(children[0].textContent);
						// @ts-ignore
						app.notify({
							title: "Code copied",
							description: "The code has been copied to your clipboard.",
							icon: Icons.clipboard.checked
						});
					}
				},
				children
			)
		]
	)
));

/**
 * EventsPage
 *
 * This page documents Proto's event system, detailing how to register and publish both
 * storage events (triggered automatically by the storage layer) and custom events.
 *
 * @returns {DocPage}
 */
export const EventsPage = () =>
	DocPage(
		{
			title: 'Events System',
			description: 'Learn how Proto supports server event listeners for storage actions and custom events.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Proto provides a powerful event system that enables decoupled communication between
					different parts of your application. The system supports both automatic storage events
					and custom events, allowing you to react to data changes and application state changes
					in real-time. Events are handled synchronously and can be used for logging, notifications,
					cache invalidation, and other side effects.`
				)
			]),

			// Event Types
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Event Types'),
				P({ class: 'text-muted-foreground' },
					`Proto supports several types of events:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("**Local Events**: In-process events using PubSub pattern"),
					Li("**Redis Events**: Distributed events across multiple instances via Redis pub/sub"),
					Li("**Storage Events**: Automatically triggered by model CRUD operations"),
					Li("**Custom Events**: Manually triggered for application-specific logic"),
					Li("**System Events**: Framework-level events for bootstrapping and lifecycle"),
					Li("**WebSocket Events**: Real-time events for connected clients")
				])
			]),

			// Redis Events (Distributed)
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Redis Events (Distributed)'),
				P({ class: 'text-muted-foreground' },
					`Proto's event system automatically supports distributed events via Redis pub/sub.
					Simply prefix your event name with "redis:" to broadcast events across all application
					instances. This enables real-time communication between multiple servers, making it
					perfect for load-balanced applications, microservices, and real-time features.`
				),
				P({ class: 'text-muted-foreground' },
					`To use Redis events, ensure Redis is configured in your configuration:`
				),
				CodeBlock(
`{
  "cache": {
	"driver": "redis",
	"connection": {
	  "host": "127.0.0.1",
	  "port": 6379,
	  "password": ""
	}
  }
}`
				),
				P({ class: 'text-muted-foreground' },
					`Subscribe to a Redis event using the same API - just add the "redis:" prefix:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Events;

// Subscribe to a distributed event (works across all instances)
Events::on('redis:order.created', function($order) {
	// This callback will be triggered on ALL instances
	EmailService::sendOrderConfirmation($order);
});

// Publish to Redis - all subscribers receive this immediately
Events::update('redis:order.created', (object)[
	'id' => 123,
	'total' => 99.99,
	'customer_id' => 456
]);`
				),
				P({ class: 'text-muted-foreground' },
					`You can also use the helper function for cleaner syntax:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Subscribe using helper
events()->subscribe('redis:user.registered', function($user) {
	NotificationService::sendWelcomeNotification($user);
});

// Publish using helper
events()->emit('redis:user.registered', [
	'id' => $user->id,
	'email' => $user->email
]);`
				)
			]),

			// Local vs Redis Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Local vs Redis Events'),
				P({ class: 'text-muted-foreground' },
					`The same API works for both local and Redis events. The only difference is the prefix:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// LOCAL EVENT - only triggers callbacks in the current process
Events::on('cache.cleared', function($data) {
	Logger::info('Cache cleared locally');
});
Events::update('cache.cleared', ['timestamp' => time()]);

// REDIS EVENT - triggers callbacks across ALL instances
Events::on('redis:cache.cleared', function($data) {
	Logger::info('Cache cleared globally');
});
Events::update('redis:cache.cleared', ['timestamp' => time()]);`
				),
				P({ class: 'text-muted-foreground' },
					`Use local events for single-instance operations and Redis events when you need
					to coordinate between multiple servers or enable real-time features.`
				)
			]),

			// Real-Time Updates with SSE
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Real-Time Updates with Server-Sent Events (SSE)'),
				P({ class: 'text-muted-foreground' },
					`Proto integrates Redis pub/sub with the EventLoop for Server-Sent Events (SSE),
					enabling real-time streaming to clients. This is perfect for live dashboards,
					notifications, chat applications, and progress tracking.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Events\\RedisAsyncEvent;
use Proto\\Http\\Loop\\EventLoop;

class NotificationController extends ApiController
{
	/**
	 * Stream real-time notifications to client via SSE
	 */
	public function stream(Request $req): void
	{
		// Set SSE headers
		header('Content-Type: text/event-stream');
		header('Cache-Control: no-cache');
		header('Connection: keep-alive');
		header('X-Accel-Buffering: no');

		$userId = $req->input('user_id');

		// Create event loop
		$loop = new EventLoop(tickInterval: 50);

		// Subscribe to user notifications via Redis
		$redisEvent = new RedisAsyncEvent(
			channels: "user:{$userId}:notifications",
			callback: function ($channel, $message) {
				echo "event: notification\\n";
				echo "data: " . json_encode($message) . "\\n\\n";
				ob_flush();
				flush();
			}
		);

		$loop->addEvent($redisEvent);

		// Send connection confirmation
		echo "event: connected\\n";
		echo "data: {\\"status\\":\\"connected\\"}\\n\\n";
		ob_flush();
		flush();

		// Start the event loop (blocks until connection closes)
		$loop->loop();
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`To publish notifications that will be streamed to connected clients:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Publish a notification (all connected clients receive it instantly)
events()->emit("redis:user:{$userId}:notifications", [
	'type' => 'message',
	'title' => 'New Message',
	'body' => 'You have a new message from John',
	'timestamp' => time()
]);`
				)
			]),

			// Storage Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Storage Events'),
				P({ class: 'text-muted-foreground' },
					`The storage layer automatically publishes events for all actions performed via the
					\`Proto\\Storages\\StorageProxy\` that models use to interface with the storage layer.
					This enables you to listen for storage events as they occur.`
				),
				P({ class: 'text-muted-foreground' },
					`To register an event, call the \`on\` method with the event name and a callback. The storage event name is formed by the model name and method name separated by a colon.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Events;

Events::on('Ticket:add', function($payload) {
	/**
	 * $payload includes:
	 * - args: the arguments passed to the storage method.
	 * - data: the data passed or retrieved from the database.
	 */
});`
				),
				P({ class: 'text-muted-foreground' },
					`To manually publish an event, call the \`update\` method:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Events;

Events::update('Ticket:add', (object)[
	'args'  => 'the args',
	'model' => 'the model data'
]);`
				),
				P({ class: 'text-muted-foreground' },
					`If you wish to listen to general storage events without specifying a model or method,
					Proto automatically publishes a "Storage" event on every update:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Events;

Events::on('Storage', function($payload) {
	/**
	 * $payload is an object containing:
	 * - target: the model name,
	 * - method: the method name,
	 * - data: the model data.
	 */
});`
				)
			]),

			// Distributed Storage Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Distributed Storage Events'),
				P({ class: 'text-muted-foreground' },
					`You can also broadcast storage events across all instances using Redis.
					This is useful when you need all servers to react to data changes, such as
					invalidating caches or updating search indexes.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Listen on all instances for user updates
Events::on('redis:User:update', function($payload) {
	// Clear user cache on ALL instances
	Cache::forget("user_{$payload->data->id}");

	// Update search index
	SearchService::updateUser($payload->data);
});

// When a user is updated, broadcast to all instances
public function update(Request $request): void
{
	$userId = $request->getInt('id');
	$data = $request->json();

	// Update user
	$user = User::update($userId, $data);

	// Broadcast to all instances
	Events::update('redis:User:update', (object)[
		'args' => [$userId, $data],
		'data' => $user
	]);

	return $this->success(['user' => $user]);
}`
				)
			]),

			// Custom Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Custom Events'),
				P({ class: 'text-muted-foreground' },
					`In addition to storage events, Proto supports custom events.
					You can register and publish custom events to allow your application to react to specific changes.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Events;

Events::on('CustomEvent', function($payload) {
	// Handle custom event logic here.
});

Events::update('CustomEvent', (object)[
	'custom' => 'custom data'
]);`
				)
			]),

			// Common Redis Event Patterns
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Common Redis Event Patterns'),
				P({ class: 'text-muted-foreground' },
					`Here are some common patterns for using Redis events in distributed applications:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// 1. Cache Invalidation Across Instances
Events::on('redis:cache.invalidate', function($payload) {
	foreach ($payload->keys as $key) {
		Cache::forget($key);
	}
});

Events::update('redis:cache.invalidate', (object)[
	'keys' => ['user_123', 'profile_123']
]);

// 2. Real-Time Chat
Events::on('redis:chat.room.{$roomId}', function($message) {
	// All connected clients in the room receive the message
	ChatLogger::log($message);
});

Events::update('redis:chat.room.lobby', (object)[
	'user' => 'John',
	'text' => 'Hello everyone!',
	'timestamp' => time()
]);

// 3. Job Progress Updates
Events::on('redis:job.{$jobId}.progress', function($progress) {
	// Stream progress to connected clients
	echo "data: " . json_encode($progress) . "\\n\\n";
});

Events::update('redis:job.export-123.progress', (object)[
	'percent' => 50,
	'status' => 'Processing records...'
]);

// 4. System-Wide Broadcasts
Events::on('redis:system.broadcast', function($announcement) {
	// Log on all instances
	Logger::critical($announcement->message);

	if ($announcement->action === 'restart') {
		// Gracefully restart services
		SystemService::restart();
	}
});

Events::update('redis:system.broadcast', (object)[
	'message' => 'Scheduled maintenance in 5 minutes',
	'action' => 'notify',
	'timestamp' => time()
]);`
				)
			]),

			// Multi-Channel Subscriptions
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Multi-Channel Subscriptions'),
				P({ class: 'text-muted-foreground' },
					`RedisAsyncEvent supports subscribing to multiple channels simultaneously,
					useful for aggregating events from different sources:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Events\\RedisAsyncEvent;
use Proto\\Http\\Loop\\EventLoop;

// Stream from multiple channels
$loop = new EventLoop();

$redisEvent = new RedisAsyncEvent(
	channels: ['orders', 'payments', 'shipments'],
	callback: function ($channel, $message) {
		// Handle different event types based on channel
		match($channel) {
			'orders' => handleOrder($message),
			'payments' => handlePayment($message),
			'shipments' => handleShipment($message)
		};

		// Send to SSE client
		echo "event: {$channel}\\n";
		echo "data: " . json_encode($message) . "\\n\\n";
		ob_flush();
		flush();
	}
);

$loop->addEvent($redisEvent);
$loop->loop();`
				)
			]),

			// Event Registration Patterns
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Event Registration Patterns'),
				P({ class: 'text-muted-foreground' },
					`Events should typically be registered during application bootstrap.
					You can register events in service providers, module boot methods, or dedicated event listeners.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// In a Service Provider or Module boot method:
class UserServiceProvider extends ServiceProvider
{
	public function boot(): void
	{
		// Listen for user creation (local)
		Events::on('User:add', [$this, 'handleUserCreated']);

		// Listen for user updates (local)
		Events::on('User:update', [$this, 'handleUserUpdated']);

		// Listen for user deletion (local)
		Events::on('User:delete', [$this, 'handleUserDeleted']);

		// Listen for distributed user events
		Events::on('redis:user.login', [$this, 'handleUserLogin']);
	}

	protected function handleUserCreated($payload): void
	{
		// Send welcome email
		EmailService::sendWelcomeEmail($payload->data);

		// Log user creation
		Logger::info('New user created', ['user_id' => $payload->data->id]);

		// Broadcast to all instances for real-time updates
		Events::update('redis:user.created', $payload->data);
	}

	protected function handleUserUpdated($payload): void
	{
		// Clear user cache
		Cache::forget("user_{$payload->data->id}");

		// Update search index
		SearchService::updateUser($payload->data);

		// Invalidate cache on all instances
		Events::update('redis:cache.invalidate', (object)[
			'keys' => ["user_{$payload->data->id}"]
		]);
	}

	protected function handleUserDeleted($payload): void
	{
		// Clean up user data
		FileStorage::deleteUserFiles($payload->args[0]);

		// Remove from all related tables
		UserCleanupService::cleanup($payload->args[0]);
	}

	protected function handleUserLogin($payload): void
	{
		// Update last login timestamp across all instances
		RedisCache::set("user_{$payload->user_id}:last_login", time());
	}
}`
				)
			]),

			// Event Payload Structure
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Event Payload Structure'),
				P({ class: 'text-muted-foreground' },
					`Events receive a payload object containing relevant data about the triggered event.
					The structure varies based on the event type:`
				),
				CodeBlock(
`// Storage Event Payload:
{
	"target": "User",           // Model name
	"method": "add",           // Storage method
	"args": [1, "data"],       // Method arguments
	"data": {                  // Model data (before/after)
		"id": 1,
		"name": "John Doe",
		"email": "john@example.com"
	}
}

// Custom Event Payload:
{
	"custom": "custom data",   // Whatever you pass to Events::update()
	"timestamp": "2024-01-01T12:00:00Z",
	"source": "OrderController"
}

// Redis Event Payload (automatically JSON encoded/decoded):
{
	"event": "user.notification",
	"user_id": 123,
	"message": "Your order has shipped",
	"timestamp": 1234567890
}`
				)
			]),

			// Multiple Event Listeners
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Multiple Event Listeners'),
				P({ class: 'text-muted-foreground' },
					`You can register multiple listeners for the same event. They will be executed
					in the order they were registered.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Multiple listeners for the same event
Events::on('User:add', function($payload) {
	// First listener: Send welcome email
	EmailService::sendWelcomeEmail($payload->data);
});

Events::on('User:add', function($payload) {
	// Second listener: Create user profile
	Profile::create(['user_id' => $payload->data->id]);
});

Events::on('User:add', function($payload) {
	// Third listener: Add to mailing list
	MailingList::subscribe($payload->data->email);
});`
				)
			]),

			// Event-Driven Architecture Patterns
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Event-Driven Architecture Patterns'),
				P({ class: 'text-muted-foreground' },
					`Events enable powerful architectural patterns for building scalable applications:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Order Processing Example
class OrderController extends ResourceController
{
	public function add(Request $request): void
	{
		$orderData = $request->json();

		// Create the order (triggers Order:add event)
		$order = Order::create($orderData);

		// Publish custom event for order processing
		Events::update('Order:Processing', (object)[
			'order_id' => $order->id,
			'total' => $order->total,
			'customer_id' => $order->customer_id
		]);

		// Broadcast to all instances for real-time updates
		Events::update('redis:order.created', $order);

		return $this->response([
			'order' => $order
		]);
	}
}

// Event Listeners for Order Processing
Events::on('Order:add', function($payload) {
	// Validate inventory
	InventoryService::reserve($payload->data);
});

Events::on('Order:Processing', function($payload) {
	// Process payment
	PaymentService::charge($payload->order_id);

	// Send order confirmation
	EmailService::sendOrderConfirmation($payload->order_id);

	// Update analytics
	AnalyticsService::trackOrder($payload);
});

Events::on('Payment:Successful', function($payload) {
	// Update order status
	Order::updateStatus($payload->order_id, 'paid');

	// Ship the order
	ShippingService::createShipment($payload->order_id);
});

// Listen on all instances for order status changes
Events::on('redis:order.created', function($order) {
	// Update live dashboard on all instances
	DashboardService::updateOrderCount();
});`
				)
			]),

			// Conditional Event Listeners
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Conditional Event Listeners'),
				P({ class: 'text-muted-foreground' },
					`You can implement conditional logic within event listeners to handle
					different scenarios based on the event data.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

Events::on('User:update', function($payload) {
	$user = $payload->data;
	$oldData = $payload->args[1] ?? null;

	// Check if email was changed
	if ($oldData && $user->email !== $oldData->email) {
		// Send email verification
		EmailService::sendEmailVerification($user);

		// Log email change
		AuditLog::log('email_changed', [
			'user_id' => $user->id,
			'old_email' => $oldData->email,
			'new_email' => $user->email
		]);
	}

	// Check if user was activated
	if ($user->status === 'active' && $oldData->status !== 'active') {
		// User just became active
		WelcomeService::sendActivationBonus($user);

		// Broadcast activation to all instances
		Events::update('redis:user.activated', $user);
	}

	// Check if user was suspended
	if ($user->status === 'suspended') {
		// Revoke all sessions across all instances
		Events::update('redis:session.revoke', (object)[
			'user_id' => $user->id
		]);
	}
});`
				)
			]),

			// Error Handling in Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Error Handling in Events'),
				P({ class: 'text-muted-foreground' },
					`Event listeners should handle errors gracefully to prevent one failing
					listener from affecting others or the main application flow.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

Events::on('User:add', function($payload) {
	try {
		// Attempt to send welcome email
		EmailService::sendWelcomeEmail($payload->data);
	} catch (Exception $e) {
		// Log error but don't fail the event
		Logger::error('Failed to send welcome email', [
			'user_id' => $payload->data->id,
			'error' => $e->getMessage()
		]);
	}
});

// For Redis events with SSE
Events::on('redis:notifications', function($message) {
	try {
		// Process notification
		NotificationService::process($message);
	} catch (Exception $e) {
		Logger::error('Notification processing failed', [
			'message' => $message,
			'error' => $e->getMessage()
		]);
		// Don't rethrow - continue processing other events
	}
});`
				)
			]),

			// Best Practices
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Best Practices'),
				P({ class: 'text-muted-foreground' },
					`Follow these best practices when working with Proto's event system:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("**Use 'redis:' prefix for distributed events**: Only add the prefix when you need cross-instance communication"),
					Li("**Clean up subscriptions**: Always unsubscribe when listeners are no longer needed"),
					Li("**Handle errors gracefully**: Wrap event logic in try-catch to prevent cascading failures"),
					Li("**Keep event names consistent**: Use clear naming patterns like 'Model:action' or 'redis:domain.event'"),
					Li("**JSON encode complex data**: Redis only supports string messages, so encode objects as JSON"),
					Li("**Use specific channel names**: Avoid overly broad patterns that could impact performance"),
					Li("**Set appropriate timeouts**: For SSE endpoints, configure server timeout settings for long connections"),
					Li("**Monitor Redis memory**: Track Redis usage when using many channels or high-frequency events"),
					Li("**Test failover scenarios**: Ensure your application handles Redis connection failures gracefully")
				])
			])
		]
	);

export default EventsPage;