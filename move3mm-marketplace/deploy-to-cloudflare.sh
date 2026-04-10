#!/bin/bash

# Move 3MM Marketplace Deployment Script
# Deploys to Cloudflare Pages (nova-5mm.pages.dev)

set -e

echo "🚀 Deploying Move 3MM Marketplace to Cloudflare Pages..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Run from move3mm-marketplace directory."
    exit 1
fi

# Create a temporary deployment directory
DEPLOY_DIR="/tmp/move3mm-deploy-$(date +%s)"
mkdir -p "$DEPLOY_DIR"

# Copy all files to deploy directory
echo "📦 Preparing deployment package..."
cp -r ./* "$DEPLOY_DIR/" 2>/dev/null || true

# Check Cloudflare Pages status
echo "🔍 Checking Cloudflare Pages configuration..."

# Check if wrangler is authenticated
if ! wrangler whoami >/dev/null 2>&1; then
    echo "⚠️  Wrangler not authenticated. Manual deployment required."
    echo ""
    echo "📋 Manual Deployment Steps:"
    echo "1. Go to: https://dash.cloudflare.com/"
    echo "2. Navigate to: Workers & Pages → Pages → nova project"
    echo "3. Click 'Upload assets'"
    echo "4. Select all files from: $DEPLOY_DIR"
    echo "5. Deploy!"
    echo ""
    echo "📁 Files to deploy:"
    ls -la "$DEPLOY_DIR/"
    exit 0
fi

# Try to deploy using wrangler
echo "📤 Attempting deployment via wrangler..."
cd "$DEPLOY_DIR"

# Check if project exists
if wrangler pages project list | grep -q "nova"; then
    echo "✅ Found 'nova' project in Cloudflare Pages"
    
    # Deploy the site
    echo "🚀 Deploying to nova-5mm.pages.dev..."
    wrangler pages deploy . --project-name=nova
    
    echo "✅ Deployment initiated!"
    echo "🌐 Site will be available at: https://nova-5mm.pages.dev"
else
    echo "❌ 'nova' project not found in Cloudflare Pages"
    echo ""
    echo "📋 Manual Setup Required:"
    echo "1. Create new Cloudflare Pages project named 'nova'"
    echo "2. Set production branch to 'main'"
    echo "3. Upload files from: $DEPLOY_DIR"
    echo "4. Custom domain: nova-5mm.pages.dev (auto-assigned)"
fi

# Cleanup
rm -rf "$DEPLOY_DIR"

echo ""
echo "🎉 Deployment preparation complete!"
echo "📊 Next steps:"
echo "   - Verify deployment at https://nova-5mm.pages.dev"
echo "   - Set up Stripe Connect for marketplace payments"
echo "   - Add real skill and website listings"
echo "   - Integrate with Fiverr and MotionInvest"