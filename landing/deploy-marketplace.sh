#!/bin/bash

# Deploy Nova 3MM Marketplace to Cloudflare Pages
# Updates https://nova-5mm.pages.dev from tripwire to marketplace

set -e

echo "🚀 Updating nova-5mm.pages.dev to Marketplace..."
echo "Current: Shopify tripwire funnel"
echo "New: Nova 3MM AI Marketplace"
echo ""

# Check current directory
PROJECT_DIR="/root/.openclaw/workspace/nova/landing"
cd "$PROJECT_DIR"

# Backup current site
echo "📦 Backing up current site..."
BACKUP_DIR="/tmp/nova-backup-$(date +%s)"
mkdir -p "$BACKUP_DIR"
cp -r ./* "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created: $BACKUP_DIR"

# Prepare marketplace files
echo "🔄 Preparing marketplace files..."

# Create marketplace deployment package
MARKETPLACE_FILES=(
    "marketplace-index.html"
    "_routes.json"
    "static.json"
)

# Check required files
for file in "${MARKETPLACE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing marketplace file: $file"
        exit 1
    fi
    echo "✅ $file ready"
done

# Rename marketplace index to main index
echo "📝 Setting up marketplace as main site..."
cp marketplace-index.html index.html

# Create Cloudflare Pages configuration if not exists
if [ ! -f "_routes.json" ]; then
    cat > _routes.json << EOF
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
EOF
    echo "✅ Created _routes.json"
fi

if [ ! -f "static.json" ]; then
    cat > static.json << EOF
{
  "headers": {
    "/*": {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Marketplace": "Nova-3MM"
    }
  }
}
EOF
    echo "✅ Created static.json"
fi

# Create deployment package
DEPLOY_DIR="/tmp/nova-marketplace-deploy-$(date +%s)"
mkdir -p "$DEPLOY_DIR"
cp index.html "$DEPLOY_DIR/"
cp _routes.json "$DEPLOY_DIR/"
cp static.json "$DEPLOY_DIR/"

echo ""
echo "📁 Deployment package ready:"
ls -la "$DEPLOY_DIR/"
echo ""

echo "🌐 Current URL: https://nova-5mm.pages.dev"
echo "🎨 New Design: Modern green AI marketplace"
echo ""

echo "🚀 Deployment Options:"
echo ""
echo "1. Cloudflare Pages Dashboard (Recommended)"
echo "   • Go to: https://dash.cloudflare.com/"
echo "   • Workers & Pages → Pages → 'nova' project"
echo "   • Upload files from: $DEPLOY_DIR"
echo "   • Replace existing deployment"
echo ""
echo "2. Wrangler CLI"
echo "   • export CLOUDFLARE_API_TOKEN=your_token"
echo "   • wrangler pages deploy $DEPLOY_DIR --project-name=nova"
echo ""
echo "3. Manual File Upload"
echo "   • Upload index.html, _routes.json, static.json"
echo "   • To Cloudflare Pages dashboard"
echo ""

echo "📊 What's Changing:"
echo "────────────────────────────────────────────"
echo "OLD: Shopify $1 tripwire funnel"
echo "     • Single product: $1 audit"
echo "     • Upsell to $49/month"
echo "     • Limited to Shopify automation"
echo ""
echo "NEW: Nova 3MM AI Marketplace"
echo "     • Dual marketplace: Skills + Websites"
echo "     • Multiple price points: $55-$25,000"
echo "     • Modern green UI design"
echo "     • Expanded business model"
echo "────────────────────────────────────────────"
echo ""

echo "✅ Ready to update nova-5mm.pages.dev!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Verify site at https://nova-5mm.pages.dev"
echo "2. Test responsive design on mobile"
echo "3. Check all links and buttons"
echo "4. Update Stripe payment integration"
echo "5. Add real product listings"
echo "6. Set up marketplace backend (Phase 2)"
echo ""

echo "💡 Note: The existing tripwire funnel will be replaced."
echo "   Backup available at: $BACKUP_DIR"
echo ""

# Cleanup
rm -rf "$DEPLOY_DIR"

echo "🎉 Marketplace update package prepared successfully!"