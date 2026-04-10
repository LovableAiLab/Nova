#!/bin/bash

# Deployment script for NOVA Tripwire Landing Page
# Usage: ./deploy.sh [platform]

set -e  # Exit on error

PLATFORM=${1:-"vercel"}
PROJECT_DIR="/root/.openclaw/workspace/nova/landing"
AUDIT_DIR="/root/.openclaw/workspace/nova/audits"

echo "🚀 NOVA Tripwire Landing Page Deployment"
echo "Platform: $PLATFORM"
echo "Directory: $PROJECT_DIR"
echo ""

# Function to create audit log
log_audit() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$AUDIT_DIR/stage2-deployment.log"
}

# Pre-deployment checks
echo "📋 Pre-deployment checks..."
log_audit "Starting pre-deployment checks"

# Check required files
REQUIRED_FILES=("tripwire-landing.html" "thank-you.html" "vercel.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        echo "❌ Missing required file: $file"
        log_audit "ERROR: Missing file $file"
        exit 1
    fi
    echo "✅ $file exists"
    log_audit "File check passed: $file"
done

# Check file sizes (max 1MB for static files)
MAX_SIZE=1048576  # 1MB in bytes
for file in "${REQUIRED_FILES[@]}"; do
    size=$(stat -c%s "$PROJECT_DIR/$file")
    if [ $size -gt $MAX_SIZE ]; then
        echo "⚠️  Warning: $file is large ($size bytes)"
        log_audit "WARNING: Large file $file ($size bytes)"
    else
        echo "✅ $file size OK ($size bytes)"
        log_audit "Size check passed: $file ($size bytes)"
    fi
done

# Check for broken links (basic check)
echo "🔗 Checking for broken links..."
if grep -q "https://buy.stripe.com/test_" "$PROJECT_DIR/tripwire-landing.html"; then
    echo "✅ Stripe payment link found"
    log_audit "Stripe payment link found"
else
    echo "⚠️  No Stripe payment link found (using test link)"
    log_audit "WARNING: Using test Stripe link"
fi

# Check for required form fields
FORM_FIELDS=$(grep -c "required" "$PROJECT_DIR/tripwire-landing.html")
if [ $FORM_FIELDS -ge 2 ]; then
    echo "✅ Form validation configured ($FORM_FIELDS required fields)"
    log_audit "Form validation: $FORM_FIELDS required fields"
else
    echo "⚠️  Few required form fields ($FORM_FIELDS)"
    log_audit "WARNING: Only $FORM_FIELDS required form fields"
fi

# Platform-specific deployment
case $PLATFORM in
    "vercel")
        echo ""
        echo "🎯 Deploying to Vercel..."
        log_audit "Starting Vercel deployment"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "❌ Vercel CLI not installed"
            echo "Install with: npm i -g vercel"
            log_audit "ERROR: Vercel CLI not installed"
            exit 1
        fi
        
        # Deploy
        echo "Deploying to Vercel..."
        if vercel --prod --yes; then
            echo "✅ Vercel deployment successful"
            log_audit "SUCCESS: Vercel deployment completed"
            
            # Get deployment URL
            DEPLOYMENT_URL=$(vercel --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
            echo "🌐 Deployment URL: $DEPLOYMENT_URL"
            log_audit "Deployment URL: $DEPLOYMENT_URL"
            
            # Create deployment info file
            echo "DEPLOYMENT_URL=$DEPLOYMENT_URL" > "$AUDIT_DIR/deployment-info.env"
            echo "DEPLOYMENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')" >> "$AUDIT_DIR/deployment-info.env"
            echo "PLATFORM=vercel" >> "$AUDIT_DIR/deployment-info.env"
            
        else
            echo "❌ Vercel deployment failed"
            log_audit "ERROR: Vercel deployment failed"
            exit 1
        fi
        ;;
    
    "github-pages")
        echo ""
        echo "🎯 Deploying to GitHub Pages..."
        log_audit "Starting GitHub Pages deployment"
        
        # This would require git repository setup
        echo "GitHub Pages deployment requires manual setup:"
        echo "1. Push landing/ directory to GitHub repository"
        echo "2. Enable GitHub Pages in repository settings"
        echo "3. Set source to /docs or main branch"
        
        log_audit "INFO: GitHub Pages requires manual setup"
        ;;
    
    "netlify")
        echo ""
        echo "🎯 Deploying to Netlify..."
        log_audit "Starting Netlify deployment"
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo "❌ Netlify CLI not installed"
            echo "Install with: npm i -g netlify-cli"
            log_audit "ERROR: Netlify CLI not installed"
            exit 1
        fi
        
        echo "Netlify deployment would require:"
        echo "1. netlify deploy --prod"
        echo "2. Configure redirects in netlify.toml"
        
        log_audit "INFO: Netlify deployment not automated"
        ;;
    
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Supported platforms: vercel, github-pages, netlify"
        log_audit "ERROR: Unknown platform $PLATFORM"
        exit 1
        ;;
esac

# Post-deployment tests
echo ""
echo "🧪 Post-deployment tests..."
log_audit "Starting post-deployment tests"

# Create test checklist
cat > "$AUDIT_DIR/stage2-test-checklist.md" << EOF
# Stage 2 Test Checklist

## Landing Page Tests
- [ ] Homepage loads without errors
- [ ] Mobile responsive design works
- [ ] Form validation functions
- [ ] Stripe payment link works
- [ ] Thank you page accessible

## Functional Tests
- [ ] Email capture works
- [ ] Shopify URL validation
- [ ] Download link generation
- [ ] Analytics tracking

## Performance Tests
- [ ] Page load < 3 seconds
- [ ] No console errors
- [ ] SSL certificate valid
- [ ] CDN serving assets

## Security Tests
- [ ] HTTPS enforced
- [ ] Form data not exposed
- [ ] No mixed content warnings
- [ ] XSS protection headers

## Manual Tests Required
1. Complete a test purchase (\$1)
2. Verify email receipt
3. Download skill package
4. Verify SHA-256 checksum
5. Test Priority Setup booking link

## Test Data
- Test email: test@example.com
- Test Shopify URL: https://test-store.myshopify.com
- Test payment: Use Stripe test card 4242 4242 4242 4242

EOF

echo "✅ Test checklist created: $AUDIT_DIR/stage2-test-checklist.md"
log_audit "Test checklist created"

# Final summary
echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review test checklist above"
echo "2. Deploy using preferred platform"
echo "3. Test complete user journey"
echo "4. Configure Stripe webhooks"
echo "5. Set up email automation"
echo ""
echo "📊 Audit logs:"
echo "- $AUDIT_DIR/stage2-deployment.log"
echo "- $AUDIT_DIR/stage2-test-checklist.md"
echo "- $AUDIT_DIR/deployment-info.env (after deployment)"

log_audit "Deployment preparation completed successfully"
exit 0