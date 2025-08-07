@echo off
REM Proto Project - Container Development Setup (Windows)
REM This script sets up the complete containerized development environment

echo 🐳 Setting up Proto Project containerized development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build all images
echo 🔨 Building Docker images...
docker-compose build --no-cache

REM Start all services
echo 🚀 Starting all services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if MariaDB is ready
echo 🗄️  Checking database connection...
for /l %%i in (1,1,30) do (
    docker-compose exec -T mariadb mysql -uroot -proot -e "SELECT 1;" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Database is ready!
        goto :database_ready
    )
    echo    Waiting for database... (attempt %%i/30)
    timeout /t 2 /nobreak >nul
)

:database_ready
REM Run migrations
echo 🔄 Running database migrations...
docker-compose exec web php run-migrations.php

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...

REM Install dependencies for each app
for %%a in (main crm developer) do (
    echo    Installing dependencies for %%a app...
    if exist "apps\%%a\package.json" (
        docker-compose exec vite-%%a npm install
    )
)

echo.
echo 🎉 Setup complete! Your containerized development environment is ready!
echo.
echo 📍 Available services:
echo    🌐 Main App (Vite):     http://localhost:3000
echo    🌐 CRM App (Vite):      http://localhost:3001
echo    🌐 Developer App (Vite): http://localhost:3002
echo    🚀 API Server:          http://localhost:8080
echo    🗄️  PHPMyAdmin:          http://localhost:8081
echo    🗄️  Database (MariaDB):  localhost:3307
echo    📝 Redis:               localhost:6380
echo.
echo 🔧 Useful commands:
echo    View logs:           docker-compose logs -f
echo    Stop all services:   docker-compose down
echo    Restart services:    docker-compose restart
echo    Access web container: docker-compose exec web bash
echo    Access database:     docker-compose exec mariadb mysql -uroot -proot proto
echo.
echo 🎯 Next steps:
echo    1. Open your browser to http://localhost:3000 for the main app
echo    2. The Vite dev servers will hot-reload your frontend changes
echo    3. API calls from frontend apps will be proxied to the PHP backend
echo    4. Database and Redis are ready for your PHP application
echo.
pause
