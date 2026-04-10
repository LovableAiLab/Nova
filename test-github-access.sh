#!/bin/bash

echo "🔍 Testing GitHub Access..."
echo ""

# Test 1: Check environment variables
echo "1. Checking environment variables:"
if [ -n "$GITHUB_TOKEN" ]; then
    echo "   ✅ GITHUB_TOKEN is set"
    TOKEN="$GITHUB_TOKEN"
elif [ -n "$GH_TOKEN" ]; then
    echo "   ✅ GH_TOKEN is set"
    TOKEN="$GH_TOKEN"
else
    echo "   ❌ No GitHub token in environment variables"
fi

# Test 2: Check for token files
echo ""
echo "2. Checking for token files:"
TOKEN_FILES=$(find /root /root/.openclaw -name "*token*" -type f 2>/dev/null | head -5)
if [ -n "$TOKEN_FILES" ]; then
    echo "   Found token files:"
    for file in $TOKEN_FILES; do
        echo "   - $file"
        # Check if it contains a GitHub token pattern
        if grep -q "ghp_\|github_pat" "$file" 2>/dev/null; then
            TOKEN=$(grep -o "ghp_[a-zA-Z0-9_]\{36,\}\|github_pat_[a-zA-Z0-9_]\{36,\}" "$file" | head -1)
            echo "   ✅ Found GitHub token in file"
        fi
    done
else
    echo "   ❌ No token files found"
fi

# Test 3: Check git credentials
echo ""
echo "3. Checking git credentials:"
if git config --global credential.helper >/dev/null 2>&1; then
    echo "   ✅ Git credential helper configured"
else
    echo "   ❌ No git credential helper"
fi

# Test 4: Test GitHub API access
echo ""
echo "4. Testing GitHub API access:"
if [ -n "$TOKEN" ]; then
    echo "   Testing with token..."
    RESPONSE=$(curl -s -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user)
    
    if echo "$RESPONSE" | grep -q '"login"'; then
        USER=$(echo "$RESPONSE" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
        echo "   ✅ Authenticated as: $USER"
        echo "   ✅ Token is valid!"
    else
        echo "   ❌ Token is invalid or has insufficient permissions"
    fi
else
    echo "   Testing without token (public access only)..."
    RESPONSE=$(curl -s https://api.github.com/repos/LovableAiLab/Nova)
    if echo "$RESPONSE" | grep -q '"name":"Nova"'; then
        echo "   ✅ Can access repository (public read)"
        echo "   ❌ Cannot write without authentication"
    else
        echo "   ❌ Cannot access repository"
    fi
fi

# Test 5: Check gh CLI
echo ""
echo "5. Checking GitHub CLI:"
if command -v gh >/dev/null 2>&1; then
    echo "   ✅ GitHub CLI is installed"
    GH_STATUS=$(gh auth status 2>&1)
    if echo "$GH_STATUS" | grep -q "Logged in"; then
        echo "   ✅ GitHub CLI is authenticated"
        echo "   $GH_STATUS" | grep "Logged in"
    else
        echo "   ❌ GitHub CLI is not authenticated"
    fi
else
    echo "   ❌ GitHub CLI is not installed"
fi

echo ""
echo "📊 Summary:"
if [ -n "$TOKEN" ]; then
    echo "✅ GitHub token found"
    echo "   You can deploy with: GITHUB_TOKEN=\"$TOKEN\" ./scripts/deploy-github.sh"
else
    echo "❌ No GitHub token found"
    echo "   You need to provide a token to deploy"
fi