#!/bin/bash

# Verify Nova 3MM Marketplace Update
# Checks that all files are ready for Cloudflare Pages deployment

set -e

echo "🔍 Verifying Nova 3MM Marketplace Update..."
echo "Site: https://nova-5mm.pages.dev"
echo ""

PROJECT_DIR="/root/.openclaw/workspace/nova"
LANDING_DIR="$PROJECT_DIR/landing"

# Check required files
echo "📁 Checking required files..."

REQUIRED_FILES=(
    "index.html"
    "_routes.json"
    "static.json"
)

ALL_GOOD=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$LANDING_DIR/$file" ]; then
        size=$(stat -c%s "$LANDING_DIR/$file" 2>/dev/null || echo "0")
        echo "✅ $file ($size bytes)"
        
        # Quick content check
        case $file in
            "index.html")
                if grep -q "Nova 3MM" "$LANDING_DIR/$file"; then
                    echo "   ✓ Contains 'Nova 3MM'"
                else
                    echo "   ⚠️  Missing 'Nova 3MM' branding"
                    ALL_GOOD=false
                fi
                
                if grep -q "gradient-bg" "$LANDING_DIR/$file"; then
                    echo "   ✓ Has modern green gradient"
                else
                    echo "   ⚠️  Missing gradient styling"
                    ALL_GOOD=false
                fi
                ;;
            "_routes.json")
                if grep -q '"include": \["/\*"\]' "$LANDING_DIR/$file"; then
                    echo "   ✓ Proper routing configuration"
                else
                    echo "   ⚠️  Routing config may be incorrect"
                    ALL_GOOD=false
                fi
                ;;
            "static.json")
                if grep -q '"Cache-Control": "public, max-age=3600"' "$LANDING_DIR/$file"; then
                    echo "   ✓ Cache headers configured"
                else
                    echo "   ⚠️  Cache headers missing"
                    ALL_GOOD=false
                fi
                ;;
        esac
    else
        echo "❌ Missing: $file"
        ALL_GOOD=false
    fi
    echo ""
done

# Check marketplace content
echo "🎯 Checking marketplace features..."

if grep -q "Shopify Pro Suite" "$LANDING_DIR/index.html"; then
    echo "✅ Shopify skill included"
else
    echo "❌ Shopify skill missing"
    ALL_GOOD=false
fi

if grep -q "Real Estate AI" "$LANDING_DIR/index.html"; then
    echo "✅ Real Estate skill included"
else
    echo "❌ Real Estate skill missing"
    ALL_GOOD=false
fi

if grep -q "Tech Gadgets Hub" "$LANDING_DIR/index.html"; then
    echo "✅ Website listings included"
else
    echo "❌ Website listings missing"
    ALL_GOOD=false
fi

echo ""
echo "🎨 Design verification..."

# Check for green gradient
if grep -q "#00dc82" "$LANDING_DIR/index.html"; then
    echo "✅ Modern green color scheme (#00dc82)"
else
    echo "❌ Green color scheme missing"
    ALL_GOOD=false
fi

# Check for responsive design
if grep -q "viewport" "$LANDING_DIR/index.html"; then
    echo "✅ Responsive meta tag present"
else
    echo "❌ Missing viewport meta tag"
    ALL_GOOD=false
fi

# Check for Tailwind CSS
if grep -q "tailwindcss.com" "$LANDING_DIR/index.html"; then
    echo "✅ Tailwind CSS included"
else
    echo "❌ Tailwind CSS missing"
    ALL_GOOD=false
fi

echo ""
echo "📊 File comparison:"
echo "────────────────────────────────────────────"
OLD_SIZE=$(stat -c%s "$LANDING_DIR/tripwire-landing.html" 2>/dev/null || echo "0")
NEW_SIZE=$(stat -c%s "$LANDING_DIR/index.html" 2>/dev/null || echo "0")

echo "Old tripwire site: $OLD_SIZE bytes"
echo "New marketplace:   $NEW_SIZE bytes"
echo "Difference:        $((NEW_SIZE - OLD_SIZE)) bytes"

if [ $NEW_SIZE -gt $OLD_SIZE ]; then
    echo "✅ Marketplace is larger (more features)"
else
    echo "⚠️  Marketplace is smaller than tripwire"
fi

echo ""
echo "🚀 Deployment Status:"

if $ALL_GOOD; then
    echo "✅ READY FOR DEPLOYMENT"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push to GitHub (if network available)"
    echo "   git push origin main"
    echo ""
    echo "2. Or manually upload to Cloudflare Pages:"
    echo "   • Go to: https://dash.cloudflare.com/"
    echo "   • Workers & Pages → Pages → 'nova' project"
    echo "   • Upload: index.html, _routes.json, static.json"
    echo "   • Deploy to: https://nova-5mm.pages.dev"
    echo ""
    echo "3. After deployment:"
    echo "   • Verify site loads"
    echo "   • Test responsive design"
    echo "   • Update Stripe integration"
    echo "   • Add real product listings"
else
    echo "❌ NOT READY - Issues found"
    echo "Please fix the issues above before deployment."
fi

echo ""
echo "💡 Note: Files are committed locally."
echo "   Run 'git push origin main' when network is available."
echo "   Cloudflare Pages will auto-deploy from GitHub."