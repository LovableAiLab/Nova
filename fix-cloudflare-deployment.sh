#!/bin/bash

# Fix Cloudflare Pages deployment for nova-5mm.pages.dev
# Clear cache and check deployment status

set -e

echo "🚀 Fixing Cloudflare Pages deployment for nova-5mm.pages.dev"
echo ""

CF_API_TOKEN="CF_API_TOKEN_PLACEHOLDER"
ZONE_ID=""  # We'll need to get this
PROJECT_NAME="nova"
DOMAIN="nova-5mm.pages.dev"

# First, let's check current deployment status
echo "🔍 Checking current site status..."
curl -s https://$DOMAIN | grep -o "<title>[^<]*</title>" | head -1

echo ""
echo "📊 Cloudflare cache status:"
curl -s -I https://$DOMAIN | grep -i "cf-cache-status\|cf-ray"

echo ""
echo "🔄 Attempting cache purge..."

# Try to purge cache using Cloudflare API
# First we need to get the zone ID
echo "Getting zone ID for $DOMAIN..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=pages.dev" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json")

echo "Zone response received"

# Check if we got a valid response
if echo "$ZONE_RESPONSE" | grep -q "success.*true"; then
    ZONE_ID=$(echo "$ZONE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Zone ID found: $ZONE_ID"
    
    # Purge cache for the domain
    echo "Purging cache for $DOMAIN..."
    PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}')
    
    if echo "$PURGE_RESPONSE" | grep -q "success.*true"; then
        echo "✅ Cache purge successful!"
        echo "Waiting 10 seconds for cache to clear..."
        sleep 10
    else
        echo "⚠️ Cache purge may have failed"
        echo "Response: $PURGE_RESPONSE"
    fi
else
    echo "❌ Could not get zone ID"
    echo "Response: $ZONE_RESPONSE"
fi

echo ""
echo "🔍 Checking Pages deployment..."

# Try to get Pages deployment info
PAGES_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ZONE_ID/pages/projects/$PROJECT_NAME/deployments" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null || echo "Could not fetch deployments")

echo "Pages deployment check completed"

echo ""
echo "🎯 Manual Steps Required:"
echo ""
echo "1. Check Cloudflare Pages Dashboard:"
echo "   https://dash.cloudflare.com/"
echo "   → Workers & Pages → Pages → 'nova' project"
echo ""
echo "2. Check deployment status:"
echo "   - Is there a recent deployment?"
echo "   - Is it successful or failed?"
echo "   - Check build logs for errors"
echo ""
echo "3. If deployment failed or missing:"
echo "   - Click 'Trigger deployment'"
echo "   - Or upload files manually"
echo ""
echo "4. Clear cache manually:"
echo "   - In Cloudflare Dashboard"
echo "   - Go to Caching → Configuration"
echo "   - Click 'Purge Everything'"
echo ""
echo "5. Verify site:"
echo "   https://nova-5mm.pages.dev"
echo "   Should show: 'Nova 3MM - AI Marketplace'"

echo ""
echo "📁 Local files are ready:"
echo "Location: /root/.openclaw/workspace/nova/landing/"
echo "Files: index.html, _routes.json, static.json"
echo ""
echo "✅ GitHub push completed: Commit b92babe"
echo "🌐 Expected: Modern green marketplace"
echo "❌ Current: Old tripwire redirect"

echo ""
echo "🚀 Quick fix options:"
echo "1. Wait 5-10 minutes for cache to auto-expire"
echo "2. Manually trigger deployment in Cloudflare"
echo "3. Upload files directly via Cloudflare dashboard"
echo "4. Use wrangler CLI: wrangler pages deploy ./landing --project-name=nova"