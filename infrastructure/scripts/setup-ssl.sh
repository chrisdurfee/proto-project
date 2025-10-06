#!/bin/bash

# SSL Certificate Setup Script for Proto Project
# This script sets up SSL certificates using Let's Encrypt

set -e

# Configuration
DOMAIN_NAME=${1:-"yourdomain.com"}
EMAIL=${2:-"admin@${DOMAIN_NAME}"}
WEBROOT_PATH="./certbot-webroot"

echo "🔐 Setting up SSL certificates for ${DOMAIN_NAME}"
echo "📧 Using email: ${EMAIL}"

# Create directories
mkdir -p ./certs
mkdir -p ./private
mkdir -p ${WEBROOT_PATH}

# Create a temporary docker-compose for certificate generation
cat > docker-compose.certbot.yaml << EOF
services:
  # Temporary web server for ACME challenge
  nginx-certbot:
    image: nginx:alpine
    container_name: proto-nginx-certbot
    ports:
      - "80:80"
    volumes:
      - ${WEBROOT_PATH}:/var/www/certbot
      - ./nginx-certbot.conf:/etc/nginx/conf.d/default.conf
    networks:
      - proto-network

  # Certbot for Let's Encrypt
  certbot:
    image: certbot/certbot
    container_name: proto-certbot
    volumes:
      - ./certs:/etc/letsencrypt
      - ${WEBROOT_PATH}:/var/www/certbot
    depends_on:
      - nginx-certbot
    networks:
      - proto-network

networks:
  proto-network:
    driver: bridge
EOF

# Create nginx configuration for ACME challenge
cat > nginx-certbot.conf << EOF
server {
    listen 80;
    server_name api.${DOMAIN_NAME} app.${DOMAIN_NAME} crm.${DOMAIN_NAME} dev.${DOMAIN_NAME};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

echo "🚀 Starting temporary web server for ACME challenge..."
docker-compose -f docker-compose.certbot.yaml up -d nginx-certbot

echo "⏳ Waiting for web server to be ready..."
sleep 5

echo "🎫 Requesting SSL certificates from Let's Encrypt..."
docker-compose -f docker-compose.certbot.yaml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --staging \
    -d api.${DOMAIN_NAME} \
    -d app.${DOMAIN_NAME} \
    -d crm.${DOMAIN_NAME} \
    -d dev.${DOMAIN_NAME}

if [ $? -eq 0 ]; then
    echo "✅ Staging certificates obtained successfully!"
    echo "🔄 Now requesting production certificates..."

    # Request production certificates
    docker-compose -f docker-compose.certbot.yaml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d api.${DOMAIN_NAME} \
        -d app.${DOMAIN_NAME} \
        -d crm.${DOMAIN_NAME} \
        -d dev.${DOMAIN_NAME}

    if [ $? -eq 0 ]; then
        echo "✅ Production certificates obtained successfully!"

        # Copy certificates to expected locations
        echo "📁 Copying certificates to Apache paths..."
        cp ./certs/live/${DOMAIN_NAME}/fullchain.pem ./certs/${DOMAIN_NAME}.crt
        cp ./certs/live/${DOMAIN_NAME}/privkey.pem ./private/${DOMAIN_NAME}.key

        # Set proper permissions
        chmod 644 ./certs/${DOMAIN_NAME}.crt
        chmod 600 ./private/${DOMAIN_NAME}.key

        echo "🎉 SSL certificates are ready!"
        echo "📍 Certificate: ./certs/${DOMAIN_NAME}.crt"
        echo "🔑 Private Key: ./private/${DOMAIN_NAME}.key"

        # Create certificate renewal script
        cat > renew-certificates.sh << EOF
#!/bin/bash
echo "🔄 Renewing SSL certificates..."
docker-compose -f docker-compose.certbot.yaml run --rm certbot renew
cp ./certs/live/${DOMAIN_NAME}/fullchain.pem ./certs/${DOMAIN_NAME}.crt
cp ./certs/live/${DOMAIN_NAME}/privkey.pem ./private/${DOMAIN_NAME}.key
echo "✅ Certificates renewed!"
EOF
        chmod +x renew-certificates.sh

        echo "📋 Next steps:"
        echo "1. Update your domain configuration in common/Config/.env"
        echo "2. Use docker-compose.production.yaml for production deployment"
        echo "3. Set up a cron job to run ./renew-certificates.sh monthly"
    else
        echo "❌ Failed to obtain production certificates"
        exit 1
    fi
else
    echo "❌ Failed to obtain staging certificates"
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up..."
docker-compose -f docker-compose.certbot.yaml down
rm -f docker-compose.certbot.yaml nginx-certbot.conf

echo "✅ SSL setup complete!"
