#!/bin/bash

# 🚀 Nova 3MM - Update to Production Stripe
# =================================================
# This script updates all test Stripe links to production

set -e

echo "🚀 Updating Nova 3MM Marketplace to Production Stripe"

# Check if production URL is provided
if [ -z "$1" ]; then
    echo "❌ ERROR: Please provide production checkout URL"
    echo "Usage: ./update-to-production.sh 'https://checkout.stripe.com/pay/cs_live_...'"
    echo ""
    echo "📋 How to get production URL:"
    echo "1. Go to Stripe dashboard (Live mode)"
    echo "2. Create payment link for $50 product"
    echo "3. Copy the checkout URL"
    exit 1
fi

PRODUCTION_URL="$1"
TEST_URL_PATTERN="https://checkout.stripe.com/c/pay/cs_test_"

echo "🔍 Searching for test checkout links..."

# Update index.html
if grep -q "$TEST_URL_PATTERN" index.html; then
    echo "✅ Updating index.html..."
    sed -i "s|$TEST_URL_PATTERN[^\"]*|$PRODUCTION_URL|g" index.html
    echo "   Updated main payment button"
fi

# Update payment-integration.html (if exists)
if [ -f "payment-integration.html" ] && grep -q "$TEST_URL_PATTERN" payment-integration.html; then
    echo "✅ Updating payment-integration.html..."
    sed -i "s|$TEST_URL_PATTERN[^\"]*|$PRODUCTION_URL|g" payment-integration.html
fi

# Update mobile menu CTA
MOBILE_CTA_PATTERN="mobile-cta-button.*checkout.stripe.com"
if grep -q "$MOBILE_CTA_PATTERN" index.html; then
    echo "✅ Updating mobile CTA button..."
    # Find and update mobile CTA link
    sed -i "/mobile-cta-button.*checkout.stripe.com/s|href=\"[^\"]*\"|href=\"$PRODUCTION_URL\"|" index.html
fi

# Update payment server .env if exists
if [ -f "payments/.env" ]; then
    echo "📝 Updating payment server configuration..."
    echo ""
    echo "Please update these values in payments/.env:"
    echo "=========================================="
    echo "STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE"
    echo "STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE"
    echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET_HERE"
    echo "STRIPE_SHOPIFY_SKILL_PRICE_ID=price_live_YOUR_PRICE_ID_HERE"
    echo "=========================================="
    echo ""
    echo "💡 Copy .env.production-ready to payments/.env and update with your keys"
fi

echo ""
echo "🎉 Update complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the production checkout link: $PRODUCTION_URL"
echo "2. Make a test purchase with a real card (small amount will be charged)"
echo "3. Verify license email delivery"
echo "4. Monitor Stripe dashboard for successful payments"
echo ""
echo "🔧 If using payment server:"
echo "   - Update payments/.env with production keys"
echo "   - Restart server: cd payments && npm start"
echo ""
echo "✅ Ready for production revenue!"