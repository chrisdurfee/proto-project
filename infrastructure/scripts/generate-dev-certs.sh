#!/bin/bash

# Generate Development SSL Certificates
# This script generates self-signed certificates for local development

set -e

SSL_DIR="./infrastructure/docker/ssl"
mkdir -p "$SSL_DIR"

echo "🔐 Generating self-signed SSL certificates for development..."

if [ -f "$SSL_DIR/localhost.key" ] && [ -f "$SSL_DIR/localhost.crt" ]; then
    echo "✅ Certificates already exist in $SSL_DIR"
    read -p "Do you want to overwrite them? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping generation."
        exit 0
    fi
fi

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/localhost.key" \
  -out "$SSL_DIR/localhost.crt" \
  -subj "/C=US/ST=Development/L=Local/O=ProtoProject/OU=Dev/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"

echo "✅ Certificates generated successfully!"
echo "📍 Certificate: $SSL_DIR/localhost.crt"
echo "🔑 Private Key: $SSL_DIR/localhost.key"
