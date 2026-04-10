#!/bin/bash

# GitHub Pages Deployment Script
# Requires: GITHUB_TOKEN environment variable
# Usage: GITHUB_TOKEN=your_token ./deploy-github.sh

set -e  # Exit on error

echo "🚀 GitHub Pages Deployment Script"
echo ""

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ ERROR: GITHUB_TOKEN environment variable not set"
    echo ""
    echo "Set your token:"
    echo "  export GITHUB_TOKEN=\"your_github_token_here\""
    echo "  OR"
    echo "  GITHUB_TOKEN=your_token ./deploy-github.sh"
    echo ""
    echo "To get a token:"
    echo "  1. Go to: https://github.com/settings/tokens"
    echo "  2. Click 'Generate new token'"
    echo "  3. Select 'repo' scope"
    echo "  4. Copy the token"
    exit 1
fi

# Configuration
REPO_OWNER="LovableAiLab"
REPO_NAME="Nova"
GH_PAGES_DIR="/root/.openclaw/workspace/nova/gh-pages"
TEMP_DIR="/tmp/nova-deploy-$$"

echo "📦 Repository: $REPO_OWNER/$REPO_NAME"
echo "📁 Source directory: $GH_PAGES_DIR"
echo ""

# Create temporary directory
echo "🔧 Preparing deployment..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clone repository
echo "📥 Cloning repository..."
git clone "https://$GITHUB_TOKEN@github.com/$REPO_OWNER/$REPO_NAME.git" .
if [ $? -ne 0 ]; then
    echo "❌ Failed to clone repository"
    echo "Check your GITHUB_TOKEN and repository permissions"
    exit 1
fi

# Check if docs folder exists
if [ -d "docs" ]; then
    echo "📁 Found existing docs folder, backing up..."
    mv docs docs.backup.$(date +%s)
fi

# Copy new files
echo "📋 Copying landing page files..."
mkdir -p docs
cp -r "$GH_PAGES_DIR"/* docs/

# Verify files were copied
if [ ! -f "docs/tripwire-landing.html" ]; then
    echo "❌ ERROR: tripwire-landing.html not found in docs/"
    exit 1
fi

echo "✅ Files copied:"
ls -la docs/

# Configure git
echo "🔧 Configuring git..."
git config user.email "deploy@nova.openclaw.ai"
git config user.name "NOVA Deploy Bot"

# Commit changes
echo "💾 Committing changes..."
git add docs/
git status

COMMIT_MESSAGE="Deploy tripwire landing page v$(date +%Y%m%d-%H%M%S)

- Landing page: tripwire-landing.html
- Thank you page: thank-you.html  
- Download page: download.html
- Auto-redirect: index.html
- Jekyll bypass: .nojekyll
- Custom domain: CNAME

Deployed: $(date)"

if git commit -m "$COMMIT_MESSAGE"; then
    echo "✅ Changes committed"
else
    echo "⚠️  No changes to commit (maybe identical files?)"
    # Check if there are actually changes
    if git diff --cached --quiet; then
        echo "📝 No changes detected, but proceeding with push"
    else
        echo "❌ Commit failed for unknown reason"
        exit 1
    fi
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push origin main; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    echo "Check your GITHUB_TOKEN permissions"
    exit 1
fi

# Enable GitHub Pages (if not already enabled)
echo "🌐 Configuring GitHub Pages..."
ENABLE_PAGES=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pages" \
  -d '{"source":{"branch":"main","path":"/docs"}}' 2>/dev/null)

if echo "$ENABLE_PAGES" | grep -q '"html_url"'; then
    echo "✅ GitHub Pages enabled/updated"
elif echo "$ENABLE_PAGES" | grep -q "already enabled"; then
    echo "✅ GitHub Pages already enabled"
else
    echo "⚠️  Could not enable GitHub Pages via API"
    echo "You may need to enable it manually:"
    echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/pages"
fi

# Get deployment URL
echo ""
echo "📊 Deployment Summary:"
echo "======================"
echo "✅ Files deployed to: docs/ folder"
echo "✅ Branch: main"
echo "✅ Commit: $(git log --oneline -1)"

# Get GitHub Pages URL
sleep 2  # Wait for GitHub to process
PAGES_URL=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pages" | \
  grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PAGES_URL" ]; then
    echo "🌐 GitHub Pages URL: $PAGES_URL"
    echo "📱 Direct links:"
    echo "   - Landing page: $PAGES_URL/tripwire-landing.html"
    echo "   - Thank you page: $PAGES_URL/thank-you.html"
    echo "   - Download page: $PAGES_URL/download.html"
else
    echo "🌐 Default GitHub Pages URL:"
    echo "   https://$REPO_OWNER.github.io/$REPO_NAME/tripwire-landing.html"
fi

# Check custom domain
if [ -f "docs/CNAME" ]; then
    CNAME=$(cat docs/CNAME)
    echo "🔗 Custom domain configured: $CNAME"
    echo "   Note: DNS must be configured separately"
fi

# Cleanup
cd /
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your landing page URL above"
echo "2. Test the complete user journey"
echo "3. Set up Stripe payment link (see stripe-integration-guide.md)"
echo "4. Update landing page with your Stripe link"
echo ""
echo "⚠️  Important: The landing page still has a TEST Stripe link"
echo "   Update line 180 in tripwire-landing.html with your production link"
echo ""
echo "🕒 Deployment time: $(date)"
echo "=========================================="