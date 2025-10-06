#!/bin/bash

# Script Runner for Proto Project
# Usage: ./run.sh <script-name> [args...]

SCRIPT_NAME="$1"
shift # Remove script name from arguments

SCRIPTS_DIR="./infrastructure/scripts"

case "$SCRIPT_NAME" in
    "sync-config")
        echo "� Syncing configuration..."
        node infrastructure/scripts/sync-config.js
    "build"|"build-production")
        echo "🏗️ Running production build..."
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            "$SCRIPTS_DIR/build-production.bat" "$@"
        else
            "$SCRIPTS_DIR/build-production.sh" "$@"
        fi
        ;;
    "setup-ssl")
        echo "🔐 Setting up SSL certificates..."
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            "$SCRIPTS_DIR/setup-ssl.bat" "$@"
        else
            "$SCRIPTS_DIR/setup-ssl.sh" "$@"
        fi
        ;;
    "setup-dev")
        echo "🛠️ Setting up development environment..."
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            "$SCRIPTS_DIR/setup-dev.bat" "$@"
        else
            "$SCRIPTS_DIR/setup-dev.sh" "$@"
        fi
        ;;
    "migrations"|"migrate")
        echo "📊 Running migrations..."
        php "$SCRIPTS_DIR/run-migrations.php" "$@"
        ;;
    "switch-env")
        echo "🔄 Switching environment..."
        "$SCRIPTS_DIR/switch-env.bat" "$@"
        ;;
    "help"|"--help"|"-h")
        echo "Proto Project Script Runner"
        echo ""
        echo "Usage: ./run.sh <script> [args...]"
        echo ""
        echo "Available scripts:"
        echo "  sync-config     Sync Proto config to Docker environment"
        echo "  build           Run production build for all apps"
        echo "  setup-ssl       Set up SSL certificates with Let's Encrypt"
        echo "  setup-dev       Set up development environment"
        echo "  migrations      Run database migrations"
        echo "  switch-env      Switch between environments"
        echo "  help            Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./run.sh sync-config"
        echo "  ./run.sh setup-ssl mydomain.com admin@mydomain.com"
        echo "  ./run.sh build"
        ;;
    "")
        echo "❌ No script specified. Use './run.sh help' for available scripts."
        exit 1
        ;;
    *)
        echo "❌ Unknown script: $SCRIPT_NAME"
        echo "Use './run.sh help' for available scripts."
        exit 1
        ;;
esac
