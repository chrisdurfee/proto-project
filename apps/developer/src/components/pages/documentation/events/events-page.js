import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { DocPage } from "../../doc-page.js";

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
 * This page documents Proto’s event system, detailing how to register and publish both
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
			Section({ class: 'space-y-4' }, [
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
			Section({ class: 'space-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Event Types'),
				P({ class: 'text-muted-foreground' },
					`Proto supports several types of events:`
				),
				Ul({ class: 'list-disc pl-6 space-y-1 text-muted-foreground' }, [
					Li("**Storage Events**: Automatically triggered by model CRUD operations"),
					Li("**Custom Events**: Manually triggered for application-specific logic"),
					Li("**System Events**: Framework-level events for bootstrapping and lifecycle"),
					Li("**WebSocket Events**: Real-time events for connected clients")
				])
			]),

			// Storage Events
			Section({ class: 'space-y-4 mt-12' }, [
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

			// Custom Events
			Section({ class: 'space-y-4 mt-12' }, [
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

			// Event Registration Patterns
			Section({ class: 'space-y-4 mt-12' }, [
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
		// Listen for user creation
		Events::on('User:add', [$this, 'handleUserCreated']);

		// Listen for user updates
		Events::on('User:update', [$this, 'handleUserUpdated']);

		// Listen for user deletion
		Events::on('User:delete', [$this, 'handleUserDeleted']);
	}

	protected function handleUserCreated($payload): void
	{
		// Send welcome email
		EmailService::sendWelcomeEmail($payload->data);

		// Log user creation
		Logger::info('New user created', ['user_id' => $payload->data->id]);
	}

	protected function handleUserUpdated($payload): void
	{
		// Clear user cache
		Cache::forget("user_{$payload->data->id}");

		// Update search index
		SearchService::updateUser($payload->data);
	}

	protected function handleUserDeleted($payload): void
	{
		// Clean up user data
		FileStorage::deleteUserFiles($payload->args[0]);

		// Remove from all related tables
		UserCleanupService::cleanup($payload->args[0]);
	}
}`
				)
			]),

			// Event Payload Structure
			Section({ class: 'space-y-4 mt-12' }, [
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
}`
				)
			]),

			// Multiple Event Listeners
			Section({ class: 'space-y-4 mt-12' }, [
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
			Section({ class: 'space-y-4 mt-12' }, [
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
});`
				)
			]),

			// Conditional Event Listeners
			Section({ class: 'space-y-4 mt-12' }, [
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
	}

	// Check if user was suspended
	if ($user->status === 'suspended') {
		// Revoke all sessions
		SessionService::revokeAllSessions($user->id);
	}
});`
				)
			]),

			// Error Handling in Events
			Section({ class: 'space-y-4 mt-12' }, [
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

	}
});`
				)
			])
		]
	);

export default EventsPage;