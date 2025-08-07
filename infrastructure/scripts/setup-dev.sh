#!/bin/bash

# Proto Project - Container Development Setup
# This script sets up the complete containerized development environment

echo "🐳 Setting up Proto Project containerized development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove any existing volumes (optional - uncomment if you want fresh data)
# echo "🗑️  Removing existing volumes..."
# docker-compose down -v

# Build all images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if MariaDB is ready
echo "🗄️  Checking database connection..."
for i in {1..30}; do
    if docker-compose exec -T mariadb mysql -uroot -proot -e "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    echo "   Waiting for database... (attempt $i/30)"
    sleep 2
done

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec web php run-migrations.php

# Install frontend dependencies and start Vite servers
echo "📦 Installing frontend dependencies..."

# Install dependencies for each app
for app in main crm developer; do
    echo "   Installing dependencies for $app app..."
    if [ -f "apps/$app/package.json" ]; then
        docker-compose exec vite-$app npm install
    fi
done

echo ""
echo "🎉 Setup complete! Your containerized development environment is ready!"
echo ""
echo "📍 Available services:"
echo "   🌐 Main App (Vite):     http://localhost:3000"
echo "   🌐 CRM App (Vite):      http://localhost:3001"
echo "   🌐 Developer App (Vite): http://localhost:3002"
echo "   🚀 API Server:          http://localhost:8080"
echo "   🗄️  PHPMyAdmin:          http://localhost:8081"
echo "   🗄️  Database (MariaDB):  localhost:3307"
echo "   📝 Redis:               localhost:6380"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:           docker-compose logs -f"
echo "   Stop all services:   docker-compose down"
echo "   Restart services:    docker-compose restart"
echo "   Access web container: docker-compose exec web bash"
echo "   Access database:     docker-compose exec mariadb mysql -uroot -proot proto"
echo ""
echo "🎯 Next steps:"
echo "   1. Open your browser to http://localhost:3000 for the main app"
echo "   2. The Vite dev servers will hot-reload your frontend changes"
echo "   3. API calls from frontend apps will be proxied to the PHP backend"
echo "   4. Database and Redis are ready for your PHP application"
echo ""
