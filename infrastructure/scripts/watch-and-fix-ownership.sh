#!/bin/bash
# Watch for file changes in bind-mounted directories and fix ownership
# This ensures files created by root in the container can be edited on the host

HOST_UID=${HOST_UID:-1000}
HOST_GID=${HOST_GID:-1000}

echo "👁️ Starting ownership watcher (fixing to ${HOST_UID}:${HOST_GID})..."

while true; do
    # Fix ownership of bind-mounted directories
    # Only change if ownership is wrong to avoid excessive chowning
    find /var/www/html/modules -type f ! -user $HOST_UID -exec chown $HOST_UID:$HOST_GID {} + 2>/dev/null || true
    find /var/www/html/common -type f ! -user $HOST_UID -exec chown $HOST_UID:$HOST_GID {} + 2>/dev/null || true
    find /var/www/html/public -type f ! -user $HOST_UID -exec chown $HOST_UID:$HOST_GID {} + 2>/dev/null || true

    # Also fix directories
    find /var/www/html/modules -type d ! -user $HOST_UID -exec chown $HOST_UID:$HOST_GID {} + 2>/dev/null || true
    find /var/www/html/common -type d ! -user $HOST_UID -exec chown $HOST_UID:$HOST_GID {} + 2>/dev/null || true
    find /var/www/html/public -type d ! -user $HOST_UID -exec chown $HOST_UID:$HOST_GID {} + 2>/dev/null || true

    # Wait before checking again
    sleep 5
done
