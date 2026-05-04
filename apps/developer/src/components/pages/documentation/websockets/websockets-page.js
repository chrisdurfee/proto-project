import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
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
							icon: null
						});
					}
				},
				children
			)
		]
	)
));

/**
 * WebSocketsPage
 *
 * This page documents Proto's real-time communication features including
 * WebSockets, Server-Sent Events (SSE), and socket management.
 *
 * @returns {DocPage}
 */
export const WebSocketsPage = () =>
	DocPage(
		{
			title: 'WebSockets & Real-time Communication',
			description: 'Learn how to implement real-time features using Proto\'s ServerEvents (SSE) and Socket systems for real-time communication.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Proto provides comprehensive real-time communication capabilities through WebSockets,
					Server-Sent Events (SSE), and socket management. These features enable real-time
					updates, live notifications, chat systems, and collaborative applications.`
				)
			]),

			// WebSockets
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'WebSockets'),
				P({ class: 'text-muted-foreground' },
					`WebSockets provide full-duplex communication between client and server.
					Proto includes a WebSocket server that can handle multiple connections,
					rooms, and real-time messaging.`
				),
				P({ class: 'text-muted-foreground' },
					`Create a WebSocket handler:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Common\\WebSocket;

use Proto\\WebSocket\\WebSocketHandler;
use Proto\\WebSocket\\Connection;

/**
 * ChatHandler
 *
 * Handles real-time chat functionality.
 */
class ChatHandler extends WebSocketHandler
{
    /**
     * Handle new connection.
     *
     * @param Connection $connection
     * @return void
     */
    public function onConnect(Connection $connection): void
    {
        // Authenticate user
        $user = $this->authenticateConnection($connection);
        if (!$user) {
            $connection->close(1008, 'Authentication required');
            return;
        }

        // Store user info
        $connection->setUser($user);

        // Join default room
        $this->joinRoom($connection, 'general');

        // Notify others
        $this->broadcastToRoom('general', [
            'type' => 'user_joined',
            'user' => $user->name,
            'timestamp' => time()
        ], $connection);
    }

    /**
     * Handle incoming message.
     *
     * @param Connection $connection
     * @param string $message
     * @return void
     */
    public function onMessage(Connection $connection, string $message): void
    {
        $data = json_decode($message, true);

        switch ($data['type']) {
            case 'chat_message':
                $this->handleChatMessage($connection, $data);
                break;

            case 'join_room':
                $this->joinRoom($connection, $data['room']);
                break;

            case 'typing':
                $this->handleTyping($connection, $data);
                break;
        }
    }

    /**
     * Handle connection close.
     *
     * @param Connection $connection
     * @return void
     */
    public function onClose(Connection $connection): void
    {
        $user = $connection->getUser();
        if ($user) {
            $this->broadcastToAllRooms([
                'type' => 'user_left',
                'user' => $user->name,
                'timestamp' => time()
            ], $connection);
        }
    }

    /**
     * Handle chat message.
     *
     * @param Connection $connection
     * @param array $data
     * @return void
     */
    private function handleChatMessage(Connection $connection, array $data): void
    {
        $user = $connection->getUser();
        $room = $data['room'] ?? 'general';

        // Validate and sanitize message
        $message = $this->sanitizeMessage($data['message']);

        // Store message in database
        modules()->chat()->storeMessage([
            'user_id' => $user->id,
            'room' => $room,
            'message' => $message,
            'timestamp' => time()
        ]);

        // Broadcast to room
        $this->broadcastToRoom($room, [
            'type' => 'chat_message',
            'user' => $user->name,
            'message' => $message,
            'room' => $room,
            'timestamp' => time()
        ]);
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`Start the WebSocket server:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\WebSocket\\Server;
use Common\\WebSocket\\ChatHandler;

$server = new Server([
    'host' => '0.0.0.0',
    'port' => 8080,
    'handlers' => [
        '/chat' => ChatHandler::class,
        '/notifications' => NotificationHandler::class
    ]
]);

$server->start();`
				)
			]),

			// Server-Sent Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Server-Sent Events (SSE)'),
				P({ class: 'text-muted-foreground' },
					`Server-Sent Events provide one-way real-time communication from server to client.
					They're perfect for live updates, notifications, and streaming data.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Notification\\Controllers;

use Proto\\Http\\SSE\\SSEController;

/**
 * NotificationSSEController
 *
 * Streams real-time notifications to clients.
 */
class NotificationSSEController extends SSEController
{
    /**
     * Stream notifications for a user.
     *
     * @return void
     */
    public function stream(): void
    {
        $userId = $this->getAuthenticatedUserId();
        if (!$userId) {
            $this->sendError('Authentication required');
            return;
        }

        // Set SSE headers
        $this->setSSEHeaders();

        // Keep connection alive and stream data
        while (true) {
            // Check for new notifications
            $notifications = modules()->notification()
                ->getUnsentForUser($userId);

            foreach ($notifications as $notification) {
                $this->sendEvent([
                    'id' => $notification->id,
                    'type' => 'notification',
                    'data' => [
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'type' => $notification->type,
                        'timestamp' => $notification->created_at
                    ]
                ]);

                // Mark as sent
                modules()->notification()
                    ->markAsSent($notification->id);
            }

            // Send heartbeat
            $this->sendHeartbeat();

            // Sleep for 5 seconds
            sleep(5);

            // Check if connection is still alive
            if (connection_aborted()) {
                break;
            }
        }
    }

    /**
     * Stream system status updates.
     *
     * @return void
     */
    public function systemStatus(): void
    {
        $this->setSSEHeaders();

        while (true) {
            $status = [
                'cpu' => sys_getloadavg()[0],
                'memory' => memory_get_usage(true),
                'connections' => $this->getActiveConnections(),
                'timestamp' => time()
            ];

            $this->sendEvent([
                'type' => 'system_status',
                'data' => $status
            ]);

            sleep(10);

            if (connection_aborted()) {
                break;
            }
        }
    }
}`
				),
				P({ class: 'text-muted-foreground' },
					`Client-side SSE implementation:`
				),
				CodeBlock(
`// JavaScript client code
const eventSource = new EventSource('/api/notifications/stream');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);

    switch(data.type) {
        case 'notification':
            showNotification(data.data);
            break;

        case 'system_status':
            updateSystemStatus(data.data);
            break;
    }
};

eventSource.onerror = function(event) {
    console.error('SSE connection error:', event);
    // Implement reconnection logic
};

function showNotification(notification) {
    // Display notification to user
    if (Notification.permission === 'granted') {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/icon.png'
        });
    }
}`
				)
			]),

			// Socket Management
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Socket Management'),
				P({ class: 'text-muted-foreground' },
					`Proto provides socket management utilities for handling connections,
					rooms, authentication, and message broadcasting.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\WebSocket;

/**
 * SocketManager
 *
 * Manages WebSocket connections and rooms.
 */
class SocketManager
{
    /**
     * Broadcast message to all connections.
     *
     * @param array $message
     * @param Connection|null $except
     * @return void
     */
    public function broadcast(array $message, ?Connection $except = null): void
    {
        foreach ($this->connections as $connection) {
            if ($except && $connection === $except) {
                continue;
            }

            $connection->send(json_encode($message));
        }
    }

    /**
     * Broadcast to specific room.
     *
     * @param string $room
     * @param array $message
     * @param Connection|null $except
     * @return void
     */
    public function broadcastToRoom(string $room, array $message, ?Connection $except = null): void
    {
        $roomConnections = $this->getRoomConnections($room);

        foreach ($roomConnections as $connection) {
            if ($except && $connection === $except) {
                continue;
            }

            $connection->send(json_encode($message));
        }
    }

    /**
     * Join connection to room.
     *
     * @param Connection $connection
     * @param string $room
     * @return void
     */
    public function joinRoom(Connection $connection, string $room): void
    {
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = [];
        }

        $this->rooms[$room][] = $connection;
        $connection->setRoom($room);
    }

    /**
     * Leave room.
     *
     * @param Connection $connection
     * @param string $room
     * @return void
     */
    public function leaveRoom(Connection $connection, string $room): void
    {
        if (isset($this->rooms[$room])) {
            $this->rooms[$room] = array_filter(
                $this->rooms[$room],
                fn($conn) => $conn !== $connection
            );
        }
    }
}`
				)
			]),

			// Real-time Features
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Real-time Features Examples'),
				P({ class: 'text-muted-foreground' },
					`Common real-time features you can implement with Proto's WebSocket and SSE systems:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("Live chat and messaging"),
					Li("Real-time notifications"),
					Li("Collaborative editing"),
					Li("Live document collaboration"),
					Li("Real-time dashboards and analytics"),
					Li("Live user presence indicators"),
					Li("Real-time form validation"),
					Li("Live system monitoring"),
					Li("Real-time game features"),
					Li("Live commenting systems")
				]),
				P({ class: 'text-muted-foreground' },
					`Example collaborative feature:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Real-time document collaboration
class DocumentHandler extends WebSocketHandler
{
    public function onMessage(Connection $connection, string $message): void
    {
        $data = json_decode($message, true);

        switch ($data['type']) {
            case 'document_edit':
                $this->handleDocumentEdit($connection, $data);
                break;

            case 'cursor_position':
                $this->handleCursorPosition($connection, $data);
                break;
        }
    }

    private function handleDocumentEdit(Connection $connection, array $data): void
    {
        $documentId = $data['document_id'];
        $operation = $data['operation'];

        // Apply operation to document
        $document = modules()->document()->applyOperation($documentId, $operation);

        // Broadcast to other users in document
        $this->broadcastToRoom("document:{$documentId}", [
            'type' => 'document_updated',
            'operation' => $operation,
            'user' => $connection->getUser()->name,
            'version' => $document->version
        ], $connection);
    }
}`
				)
			]),

			// Configuration
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Configuration'),
				P({ class: 'text-muted-foreground' },
					`Configure WebSocket and SSE settings in your Common/Config/.env file:`
				),
				CodeBlock(
`{
    "websockets": {
        "enabled": true,
        "host": "0.0.0.0",
        "port": 8080,
        "max_connections": 1000,
        "heartbeat_interval": 30,
        "timeout": 60,
        "ssl": {
            "enabled": false,
            "cert": "/path/to/cert.pem",
            "key": "/path/to/key.pem"
        }
    },
    "sse": {
        "enabled": true,
        "max_connections": 500,
        "heartbeat_interval": 30,
        "buffer_size": 1024
    }
}`
				)
			])
		]
	);

export default WebSocketsPage;
