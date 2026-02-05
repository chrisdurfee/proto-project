#!/bin/bash

# Trust Development SSL Certificates on Linux
# This script adds the self-signed certificate to the system and Chrome trust stores.

set -e

CERT_FILE="./infrastructure/docker/ssl/localhost.crt"
CERT_NAME="Rally Localhost"

if [ ! -f "$CERT_FILE" ]; then
    echo "❌ Certificate not found at $CERT_FILE"
    echo "Please run generate-dev-certs.sh first."
    exit 1
fi

echo "🔐 Trusting certificate on Linux..."

# 1. Add to System Trust Store (requires sudo)
if command -v update-ca-certificates >/dev/null; then
    echo "sudo access is required to update system certificates."
    sudo cp "$CERT_FILE" "/usr/local/share/ca-certificates/rally-localhost.crt"
    sudo update-ca-certificates
    echo "✅ Added to system trust store."
else
    echo "⚠️  'update-ca-certificates' not found. Skipping system trust."
fi

# 2. Add to Chrome/Chromium Trust Store (NSS DB)
if command -v certutil >/dev/null; then
    # Check if database exists
    if [ -d "$HOME/.pki/nssdb" ]; then
        certutil -d "sql:$HOME/.pki/nssdb" -A -t "P,," -n "$CERT_NAME" -i "$CERT_FILE"
        echo "✅ Added to Chrome/Chromium trust store ($HOME/.pki/nssdb)."
    else
        echo "⚠️  NSS DB not found at $HOME/.pki/nssdb. Have you run Chrome yet?"
    fi
else
    echo "⚠️  'certutil' is not installed. Install 'libnss3-tools' to trust in Chrome."
    echo "   sudo apt install libnss3-tools"
fi

echo ""
echo "🎉 Certificate trusted! You may need to restart Chrome."
