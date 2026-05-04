#!/bin/bash

# Production Build Script for Subdomain Deployment
# This script builds all frontend apps for production deployment to subdomains

echo "🚀 Building Rally for Subdomain Deployment..."

# Set production environment
export NODE_ENV=production

# Build Main App
echo "📦 Building Main App (app.domain.com)..."
cd apps/main
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Main app build failed"
    exit 1
fi
echo "✅ Main app built successfully -> public/main/"

# Build CRM App
echo "📦 Building CRM App (crm.domain.com)..."
cd ../crm
npm run build
if [ $? -ne 0 ]; then
    echo "❌ CRM app build failed"
    exit 1
fi
echo "✅ CRM app built successfully -> public/crm/"

# Build Developer App
echo "📦 Building Developer App (dev.domain.com)..."
cd ../developer
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Developer app build failed"
    exit 1
fi
echo "✅ Developer app built successfully -> public/developer/"

# Return to root
cd ../..

echo ""
echo "🎉 All apps built successfully!"
echo ""
echo "📁 Build Output:"
echo "   • Main App:      public/main/      → app.domain.com"
echo "   • CRM App:       public/crm/       → crm.domain.com"
echo "   • Developer App: public/developer/ → dev.domain.com"
echo "   • API:           public/api/       → api.domain.com"
echo ""
echo "📝 Next Steps:"
echo "   1. Deploy these files to your web server"
echo "   2. Configure DNS A records for subdomains"
echo "   3. Set up Apache/Nginx virtual hosts"
echo "   4. Add SSL certificates for production"
echo ""
