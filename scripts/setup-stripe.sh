#!/bin/bash

# Stripe Setup Script for NOVA Tripwire Funnel
# Run this with your Stripe keys

set -e

echo "🚀 NOVA Tripwire Funnel - Stripe Setup"
echo "========================================"
echo ""

# Check if keys are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Usage: $0 <stripe_secret_key> <stripe_public_key>"
    echo ""
    echo "Example:"
    echo "  $0 sk_test_51P... pk_test_51P..."
    echo ""
    echo "Get your keys from: https://dashboard.stripe.com/apikeys"
    exit 1
fi

STRIPE_SECRET_KEY="$1"
STRIPE_PUBLIC_KEY="$2"

echo "✅ Keys received"
echo "   Secret key: ${STRIPE_SECRET_KEY:0:15}..."
echo "   Public key: ${STRIPE_PUBLIC_KEY:0:15}..."
echo ""

# Test Stripe API connection
echo "🔌 Testing Stripe API connection..."
RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    https://api.stripe.com/v1/products -o /tmp/stripe_test.json)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Stripe API connection successful!"
else
    echo "❌ Stripe API connection failed (HTTP $RESPONSE)"
    cat /tmp/stripe_test.json
    exit 1
fi

echo ""
echo "🛒 Creating $1 product..."
echo ""

# Create the $1 product
PRODUCT_RESPONSE=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    -d "name=Shopify Inventory Automation Audit" \
    -d "description=Professional stock-leak audit + OpenClaw skill package" \
    -d "metadata[tripwire]=true" \
    -d "metadata[requires_shopify_url]=true" \
    https://api.stripe.com/v1/products)

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Product created: $PRODUCT_ID"

echo ""
echo "💰 Creating $1.00 price..."
echo ""

# Create price for the product
PRICE_RESPONSE=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    -d "product=$PRODUCT_ID" \
    -d "unit_amount=100" \
    -d "currency=usd" \
    https://api.stripe.com/v1/prices)

PRICE_ID=$(echo "$PRICE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Price created: $PRICE_ID"

echo ""
echo "🔗 Generating payment link..."
echo ""

# Create payment link
PAYMENT_LINK_RESPONSE=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    -d "line_items[0][price]=$PRICE_ID" \
    -d "line_items[0][quantity]=1" \
    -d "metadata[product_type]=tripwire" \
    -d "after_completion[type]=redirect" \
    -d "after_completion[redirect][url]=https://8c0df71b.nova-5mm.pages.dev/thank-you.html" \
    -d "custom_fields[0][key]=shopify_url" \
    -d "custom_fields[0][label]=Shopify Store URL" \
    -d "custom_fields[0][type]=text" \
    -d "custom_fields[0][optional]=false" \
    -d "custom_text[submit][message]=Your audit will be delivered within 24 hours!" \
    https://api.stripe.com/v1/payment_links)

PAYMENT_LINK=$(echo "$PAYMENT_LINK_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "✅ Payment link created!"
echo ""
echo "🌐 Your payment link:"
echo "   $PAYMENT_LINK"
echo ""

# Save to file
echo "$PAYMENT_LINK" > /tmp/nova-payment-link.txt
echo "📁 Payment link saved to: /tmp/nova-payment-link.txt"

echo ""
echo "📝 Updating landing page..."
echo ""

# Update the landing page with the payment link
cd /root/.openclaw/workspace/nova
sed -i "s|https://buy.stripe.com/test_00g3fV7jU7mF2wU5kk|$PAYMENT_LINK|g" tripwire-landing.html

echo "✅ Landing page updated with production payment link!"
echo ""
echo "🎉 STRIPE SETUP COMPLETE!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Test the payment link: $PAYMENT_LINK"
echo "2. Use test card: 4242 4242 4242 4242"
echo "3. Visit your site: https://8c0df71b.nova-5mm.pages.dev/tripwire-landing.html"
echo "4. Complete a test purchase"
echo "5. Verify thank you page loads"
echo ""
echo "Your tripwire funnel is now LIVE with Stripe integration! 🚀"