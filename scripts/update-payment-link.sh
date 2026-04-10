#!/bin/bash

# Update Payment Link Script
# Run this in your terminal where Stripe keys are set

set -e

echo "🔗 Getting Stripe payment link..."
echo ""

# Get payment link from Stripe API
PAYMENT_LINK=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    https://api.stripe.com/v1/payment_links | \
    grep -o '"url":"[^"]*"' | \
    cut -d'"' -f4 | \
    head -1)

if [ -z "$PAYMENT_LINK" ]; then
    echo "❌ No payment link found. Creating new one..."
    
    # Get product ID
    PRODUCT_ID=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        https://api.stripe.com/v1/products | \
        grep -o '"id":"[^"]*"' | \
        cut -d'"' -f4 | \
        head -1)
    
    if [ -z "$PRODUCT_ID" ]; then
        echo "❌ No product found. Please run setup-stripe.sh first."
        exit 1
    fi
    
    # Get price ID
    PRICE_ID=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        "https://api.stripe.com/v1/prices?product=$PRODUCT_ID" | \
        grep -o '"id":"[^"]*"' | \
        cut -d'"' -f4 | \
        head -1)
    
    # Create payment link
    PAYMENT_LINK_RESPONSE=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        -d "line_items[0][price]=$PRICE_ID" \
        -d "line_items[0][quantity]=1" \
        -d "after_completion[type]=redirect" \
        -d "after_completion[redirect][url]=https://8c0df71b.nova-5mm.pages.dev/thank-you.html" \
        -d "custom_fields[0][key]=shopify_url" \
        -d "custom_fields[0][label]=Shopify Store URL" \
        -d "custom_fields[0][type]=text" \
        -d "custom_fields[0][optional]=false" \
        https://api.stripe.com/v1/payment_links)
    
    PAYMENT_LINK=$(echo "$PAYMENT_LINK_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$PAYMENT_LINK" ]; then
    echo "❌ Failed to get or create payment link"
    exit 1
fi

echo "✅ Payment link found:"
echo "   $PAYMENT_LINK"
echo ""

# Save to file
echo "$PAYMENT_LINK" > /tmp/nova-payment-link.txt
echo "📁 Saved to: /tmp/nova-payment-link.txt"
echo ""

# Update landing pages
echo "🔄 Updating landing pages..."
echo ""

# Update all landing page files
find /root/.openclaw/workspace/nova -name "tripwire-landing.html" -type f | while read file; do
    echo "  Updating: $file"
    sed -i "s|https://buy.stripe.com/test_00g3fV7jU7mF2wU5kk|$PAYMENT_LINK|g" "$file"
    sed -i "s|https://buy.stripe.com/test_[^\"]*|$PAYMENT_LINK|g" "$file"
done

echo ""
echo "✅ All landing pages updated!"
echo ""
echo "🚀 Next steps:"
echo "1. Commit and push changes to GitHub"
echo "2. Cloudflare Pages will redeploy automatically"
echo "3. Test your funnel with card: 4242 4242 4242 4242"
echo ""
echo "🎉 Your test funnel is ready!"