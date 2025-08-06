@echo off
REM Windows batch script to sync Proto configuration to Docker

echo 🔄 Syncing configuration from Proto to Docker...
node sync-config.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Configuration synced successfully!
    echo 💡 Restart Docker containers to apply changes:
    echo    docker-compose restart
) else (
    echo ❌ Configuration sync failed!
    exit /b 1
)
