#!/bin/bash

# Linux/macOS script to sync Proto configuration to Docker

echo "🔄 Syncing configuration from Proto to Docker..."
node infrastructure/scripts/sync-config.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration synced successfully!"
    echo "💡 Restart Docker containers to apply changes:"
    echo "   docker-compose restart"
else
    echo "❌ Configuration sync failed!"
    exit 1
fi
