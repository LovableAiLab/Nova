#!/bin/bash

# Test Email Automation Script
# Run this after setting up Stripe Customer Journey

echo "📧 Testing Stripe Email Automation"
echo "=================================="
echo ""

echo "1. Make a test payment:"
echo "   - Visit: https://lovableailab.github.io/Nova/tripwire-landing.html"
echo "   - Fill form with TEST data:"
echo "     Email: test@example.com"
echo "     Shopify URL: test.myshopify.com"
echo "     Revenue: Under $10K"
echo "   - Click: 'Pay $1 with Stripe'"
echo "   - Use test card: 4242 4242 4242 4242"
echo "   - Complete payment"
echo ""

echo "2. Check email delivery:"
echo "   - Check test@example.com inbox"
echo "   - Look for: 'Your Shopify Inventory Audit is Ready!'"
echo "   - Should arrive within 1-2 minutes"
echo ""

echo "3. Verify email contents:"
echo "   - Download link should work"
echo "   - SHA-256 checksum should match"
echo "   - Installation instructions clear"
echo ""

echo "4. Test automation timing:"
echo "   - Immediate email: ✅ Should work"
echo "   - Future emails: Will test over next 7 days"
echo ""

echo "5. Troubleshooting checklist:"
echo "   ✅ Stripe Customer Journey created"
echo "   ✅ Email template published"
echo "   ✅ Trigger: 'Payment succeeded'"
echo "   ✅ Test payment completed"
echo "   ❓ Email received (check spam)"
echo ""

echo "🎯 Next steps after testing:"
echo "   - Go live with real payments"
echo "   - Monitor email open rates"
echo "   - Set up additional email sequences"
echo "   - Configure analytics tracking"
echo ""

echo "🚀 Your email automation is ready to test!"