#!/bin/bash

# Enable GitHub Pages Script
# Usage: GITHUB_TOKEN=your_token ./enable-pages.sh

set -e

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ ERROR: GITHUB_TOKEN not set"
    echo "Usage: GITHUB_TOKEN=your_token ./enable-pages.sh"
    exit 1
fi

REPO_OWNER="LovableAiLab"
REPO_NAME="Nova"

echo "🌐 Enabling GitHub Pages for $REPO_OWNER/$REPO_NAME..."
echo ""

# Enable GitHub Pages
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pages" \
  -d '{"source":{"branch":"main","path":"/docs"}}')

if echo "$RESPONSE" | grep -q '"html_url"'; then
    echo "✅ GitHub Pages enabled!"
    URL=$(echo "$RESPONSE" | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)
    echo "🌐 URL: $URL"
elif echo "$RESPONSE" | grep -q "already enabled"; then
    echo "✅ GitHub Pages already enabled"
    
    # Get current Pages info
    INFO=$(curl -s \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pages")
    
    if echo "$INFO" | grep -q '"html_url"'; then
        URL=$(echo "$INFO" | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)
        echo "🌐 URL: $URL"
    fi
else
    echo "⚠️ Could not enable via API"
    echo "Enable manually: https://github.com/$REPO_OWNER/$REPO_NAME/settings/pages"
    echo "Set: Source = main branch, /docs folder"
fi

echo ""
echo "📋 Test your site:"
echo "1. https://lovableailab.github.io/Nova/tripwire-landing.html"
echo "2. https://lovableailab.github.io/Nova/thank-you.html"
echo "3. https://lovableailab.github.io/Nova/download.html"
echo ""
echo "🕒 Note: It may take 1-5 minutes to become accessible"