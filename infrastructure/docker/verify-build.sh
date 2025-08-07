#!/bin/bash

# Build verification script
echo "🔍 Verifying Docker build..."

# Check if essential directories exist
check_directory() {
    if [ -d "$1" ]; then
        echo "✅ Directory exists: $1"
    else
        echo "❌ Missing directory: $1"
        return 1
    fi
}

# Check if essential files exist
check_file() {
    if [ -f "$1" ]; then
        echo "✅ File exists: $1"
    else
        echo "❌ Missing file: $1"
        return 1
    fi
}

echo "📁 Checking directory structure..."
check_directory "vendor"
check_directory "common"
check_directory "modules"
check_directory "public"

echo
echo "📄 Checking essential files..."
check_file "vendor/autoload.php"
check_file "composer.json"
check_file ".htaccess"

echo
echo "🔧 Checking PHP configuration..."
php -v
echo "PHP modules loaded: $(php -m | wc -l)"

echo
echo "🌐 Checking Apache configuration..."
apache2ctl configtest

echo
echo "✅ Build verification complete!"
