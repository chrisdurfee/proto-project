#!/bin/bash

# Script to enable Apache modules with error handling
echo "Enabling Apache modules..."

# Core modules (should always be available)
CORE_MODULES="rewrite headers expires alias dir env mime setenvif"
for mod in $CORE_MODULES; do
    if a2enmod $mod 2>/dev/null; then
        echo "✓ Enabled $mod"
    else
        echo "✗ Failed to enable $mod"
    fi
done

# Authentication modules
AUTH_MODULES="auth_basic authn_core authn_file authz_core authz_host authz_user"
for mod in $AUTH_MODULES; do
    if a2enmod $mod 2>/dev/null; then
        echo "✓ Enabled $mod"
    else
        echo "✗ Failed to enable $mod"
    fi
done

# Performance modules (may not be available in all images)
PERF_MODULES="deflate brotli cache cache_disk filter"
for mod in $PERF_MODULES; do
    if a2enmod $mod 2>/dev/null; then
        echo "✓ Enabled $mod"
    else
        echo "⚠ $mod not available (optional)"
    fi
done

# Optional modules
OPT_MODULES="http2 ssl proxy proxy_fcgi info status version"
for mod in $OPT_MODULES; do
    if a2enmod $mod 2>/dev/null; then
        echo "✓ Enabled $mod"
    else
        echo "⚠ $mod not available (optional)"
    fi
done

echo "Module configuration complete!"
