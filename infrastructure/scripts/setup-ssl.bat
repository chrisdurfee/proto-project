@echo off
REM SSL Certificate Setup Script for Proto Project (Windows)
REM This script sets up SSL certificates using Let's Encrypt

if "%~1"=="" (
    set DOMAIN_NAME=yourdomain.com
) else (
    set DOMAIN_NAME=%~1
)

if "%~2"=="" (
    set EMAIL=admin@%DOMAIN_NAME%
) else (
    set EMAIL=%~2
)

echo 🔐 Setting up SSL certificates for %DOMAIN_NAME%
echo 📧 Using email: %EMAIL%

REM Create directories
if not exist "certs" mkdir certs
if not exist "private" mkdir private
if not exist "certbot-webroot" mkdir certbot-webroot

REM Create a temporary docker-compose for certificate generation
(
echo services:
echo   # Temporary web server for ACME challenge
echo   nginx-certbot:
echo     image: nginx:alpine
echo     container_name: proto-nginx-certbot
echo     ports:
echo       - "80:80"
echo     volumes:
echo       - ./certbot-webroot:/var/www/certbot
echo       - ./nginx-certbot.conf:/etc/nginx/conf.d/default.conf
echo     networks:
echo       - proto-network
echo.
echo   # Certbot for Let's Encrypt
echo   certbot:
echo     image: certbot/certbot
echo     container_name: proto-certbot
echo     volumes:
echo       - ./certs:/etc/letsencrypt
echo       - ./certbot-webroot:/var/www/certbot
echo     depends_on:
echo       - nginx-certbot
echo     networks:
echo       - proto-network
echo.
echo networks:
echo   proto-network:
echo     driver: bridge
) > docker-compose.certbot.yaml

REM Create nginx configuration for ACME challenge
(
echo server {
echo     listen 80;
echo     server_name api.%DOMAIN_NAME% app.%DOMAIN_NAME% crm.%DOMAIN_NAME% dev.%DOMAIN_NAME%;
echo.
echo     location /.well-known/acme-challenge/ {
echo         root /var/www/certbot;
echo     }
echo.
echo     location / {
echo         return 301 https://$server_name$request_uri;
echo     }
echo }
) > nginx-certbot.conf

echo 🚀 Starting temporary web server for ACME challenge...
docker-compose -f docker-compose.certbot.yaml up -d nginx-certbot

echo ⏳ Waiting for web server to be ready...
timeout /t 5 > nul

echo 🎫 Requesting SSL certificates from Let's Encrypt (staging)...
docker-compose -f docker-compose.certbot.yaml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email %EMAIL% --agree-tos --no-eff-email --staging -d api.%DOMAIN_NAME% -d app.%DOMAIN_NAME% -d crm.%DOMAIN_NAME% -d dev.%DOMAIN_NAME%

if %errorlevel% equ 0 (
    echo ✅ Staging certificates obtained successfully!
    echo 🔄 Now requesting production certificates...

    REM Request production certificates
    docker-compose -f docker-compose.certbot.yaml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email %EMAIL% --agree-tos --no-eff-email --force-renewal -d api.%DOMAIN_NAME% -d app.%DOMAIN_NAME% -d crm.%DOMAIN_NAME% -d dev.%DOMAIN_NAME%

    if %errorlevel% equ 0 (
        echo ✅ Production certificates obtained successfully!

        REM Copy certificates to expected locations
        echo 📁 Copying certificates to Apache paths...
        copy "certs\live\%DOMAIN_NAME%\fullchain.pem" "certs\%DOMAIN_NAME%.crt" > nul
        copy "certs\live\%DOMAIN_NAME%\privkey.pem" "private\%DOMAIN_NAME%.key" > nul

        echo 🎉 SSL certificates are ready!
        echo 📍 Certificate: certs\%DOMAIN_NAME%.crt
        echo 🔑 Private Key: private\%DOMAIN_NAME%.key

        REM Create certificate renewal script
        (
        echo @echo off
        echo echo 🔄 Renewing SSL certificates...
        echo docker-compose -f docker-compose.certbot.yaml run --rm certbot renew
        echo copy "certs\live\%DOMAIN_NAME%\fullchain.pem" "certs\%DOMAIN_NAME%.crt" ^> nul
        echo copy "certs\live\%DOMAIN_NAME%\privkey.pem" "private\%DOMAIN_NAME%.key" ^> nul
        echo echo ✅ Certificates renewed!
        ) > renew-certificates.bat

        echo 📋 Next steps:
        echo 1. Update your domain configuration in common/Config/.env
        echo 2. Use docker-compose.prod.yaml for production deployment
        echo 3. Set up a scheduled task to run renew-certificates.bat monthly
    ) else (
        echo ❌ Failed to obtain production certificates
        exit /b 1
    )
) else (
    echo ❌ Failed to obtain staging certificates
    exit /b 1
)

REM Cleanup
echo 🧹 Cleaning up...
docker-compose -f docker-compose.certbot.yaml down
del docker-compose.certbot.yaml nginx-certbot.conf

echo ✅ SSL setup complete!
