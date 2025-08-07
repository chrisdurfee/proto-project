@echo off
REM Script Runner for Proto Project (Windows)
REM Usage: run.bat <script-name> [args...]

set SCRIPT_NAME=%1
set SCRIPTS_DIR=infrastructure\scripts

if "%SCRIPT_NAME%"=="" (
    echo ❌ No script specified. Use 'run.bat help' for available scripts.
    exit /b 1
)

if "%SCRIPT_NAME%"=="sync" goto sync
if "%SCRIPT_NAME%"=="sync-config" goto sync
if "%SCRIPT_NAME%"=="build" goto build
if "%SCRIPT_NAME%"=="build-production" goto build
if "%SCRIPT_NAME%"=="setup-ssl" goto setup-ssl
if "%SCRIPT_NAME%"=="setup-dev" goto setup-dev
if "%SCRIPT_NAME%"=="migrations" goto migrations
if "%SCRIPT_NAME%"=="migrate" goto migrations
if "%SCRIPT_NAME%"=="switch-env" goto switch-env
if "%SCRIPT_NAME%"=="help" goto help
if "%SCRIPT_NAME%"=="--help" goto help
if "%SCRIPT_NAME%"=="-h" goto help

echo ❌ Unknown script: %SCRIPT_NAME%
echo Use 'run.bat help' for available scripts.
exit /b 1

:sync
echo 🔄 Syncing configuration...
node sync-config.js
goto end

:build
echo 🏗️ Running production build...
call "%SCRIPTS_DIR%\build-production.bat" %2 %3 %4 %5 %6 %7 %8 %9
goto end

:setup-ssl
echo 🔐 Setting up SSL certificates...
call "%SCRIPTS_DIR%\setup-ssl.bat" %2 %3 %4 %5 %6 %7 %8 %9
goto end

:setup-dev
echo 🛠️ Setting up development environment...
call "%SCRIPTS_DIR%\setup-dev.bat" %2 %3 %4 %5 %6 %7 %8 %9
goto end

:migrations
echo 📊 Running migrations...
php "%SCRIPTS_DIR%\run-migrations.php" %2 %3 %4 %5 %6 %7 %8 %9
goto end

:switch-env
echo 🔄 Switching environment...
call "%SCRIPTS_DIR%\switch-env.bat" %2 %3 %4 %5 %6 %7 %8 %9
goto end

:help
echo Proto Project Script Runner
echo.
echo Usage: run.bat ^<script^> [args...]
echo.
echo Available scripts:
echo   sync-config     Sync Proto config to Docker environment
echo   build           Run production build for all apps
echo   setup-ssl       Set up SSL certificates with Let's Encrypt
echo   setup-dev       Set up development environment
echo   migrations      Run database migrations
echo   switch-env      Switch between environments
echo   help            Show this help message
echo.
echo Examples:
echo   run.bat sync-config
echo   run.bat setup-ssl mydomain.com admin@mydomain.com
echo   run.bat build
goto end

:end
