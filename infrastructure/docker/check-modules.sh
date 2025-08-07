#!/bin/bash

echo "=== Apache Module Status Check ==="
echo "Checking if all required modules are enabled..."
echo

# Check if Apache is running
if ! pgrep apache2 > /dev/null; then
    echo "⚠ Apache is not running!"
    exit 1
fi

# Essential modules for .htaccess functionality
REQUIRED_MODULES=(
    "rewrite_module"
    "headers_module"
    "expires_module"
    "deflate_module"
    "alias_module"
    "mime_module"
    "dir_module"
    "env_module"
    "setenvif_module"
)

OPTIONAL_MODULES=(
    "brotli_module"
    "cache_module"
    "cache_disk_module"
    "filter_module"
    "http2_module"
    "ssl_module"
)

echo "✓ Required modules:"
for module in "${REQUIRED_MODULES[@]}"; do
    if apache2ctl -M 2>/dev/null | grep -q "$module"; then
        echo "  ✓ $module"
    else
        echo "  ✗ $module (MISSING - .htaccess features may not work)"
    fi
done

echo
echo "⚡ Performance modules:"
for module in "${OPTIONAL_MODULES[@]}"; do
    if apache2ctl -M 2>/dev/null | grep -q "$module"; then
        echo "  ✓ $module"
    else
        echo "  - $module (not available)"
    fi
done

echo
echo "=== Configuration Test ==="
if apache2ctl configtest 2>/dev/null; then
    echo "✓ Apache configuration is valid"
else
    echo "✗ Apache configuration has errors"
fi

echo
echo "=== Performance Features Status ==="
echo "Compression: $(apache2ctl -M 2>/dev/null | grep -E '(deflate|brotli)' | wc -l) modules available"
echo "Caching: $(apache2ctl -M 2>/dev/null | grep -E '(expires|cache)' | wc -l) modules available"
echo "Security: $(apache2ctl -M 2>/dev/null | grep -E '(headers|rewrite)' | wc -l) modules available"
