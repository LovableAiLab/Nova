#!/bin/bash
# NOVA 30-Minute Heartbeat Monitor
# Checks build sessions, deployments, and system health

set -e

echo "=== NOVA Heartbeat Monitor - $(date) ==="

# Configuration
NOVA_DIR="/root/.openclaw/workspace/nova"
LOG_DIR="$NOVA_DIR/logs"
mkdir -p $LOG_DIR

# 1. Check Ralph Loop Build Sessions
echo "1. Checking Ralph Loop build sessions..."

RALPH_SESSION="agent:main:subagent:2bb80247-ccc4-4d36-92a8-ba52bddad3d6"
SESSION_ACTIVE=$(sessions_list 2>/dev/null | grep -c "$RALPH_SESSION" || echo "0")

if [ "$SESSION_ACTIVE" -eq 1 ]; then
    echo "   ✅ Ralph Loop active: Shopify skill build in progress"
    
    # Check build progress
    BUILD_DIR="$NOVA_DIR/shopify-inventory-skill"
    if [ -d "$BUILD_DIR" ]; then
        FILES_COUNT=$(find "$BUILD_DIR" -type f \( -name "*.md" -o -name "*.js" -o -name "*.py" -o -name "*.json" \) 2>/dev/null | wc -l)
        echo "   📁 Files created: $FILES_COUNT"
        
        if [ -f "$BUILD_DIR/SKILL.md" ]; then
            SKILL_LINES=$(wc -l < "$BUILD_DIR/SKILL.md")
            echo "   📄 SKILL.md: $SKILL_LINES lines"
        fi
    fi
else
    echo "   ❌ Ralph Loop not active"
    
    # Check if build completed
    if [ -f "$BUILD_DIR/SKILL.md" ] && [ -f "$BUILD_DIR/package.json" ]; then
        echo "   ✅ Build appears completed - checking artifacts..."
        
        # Auto-restart if build seems incomplete
        MISSING_FILES=0
        for file in "SKILL.md" "config/shopify.json" "scripts/inventory-sync.js"; do
            if [ ! -f "$BUILD_DIR/$file" ]; then
                MISSING_FILES=$((MISSING_FILES + 1))
            fi
        done
        
        if [ $MISSING_FILES -gt 1 ]; then
            echo "   🚨 Build incomplete - $MISSING_FILES key files missing"
            echo "   Consider restarting Ralph Loop"
        fi
    fi
fi

# 2. Check GitHub Repository Status
echo "2. Checking GitHub repository..."
cd $NOVA_DIR
GIT_STATUS=$(git status --porcelain 2>/dev/null | wc -l)
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

if [ "$GIT_STATUS" -gt 0 ]; then
    echo "   ⚠️  Uncommitted changes: $GIT_STATUS files"
    echo "   Consider: git add . && git commit -m 'Auto-update'"
else
    echo "   ✅ Repository clean"
fi

echo "   🌿 Current branch: $GIT_BRANCH"

# 3. Check Vercel Deployment Status
echo "3. Checking deployment status..."
if [ -f "$NOVA_DIR/vercel.json" ]; then
    echo "   ✅ Vercel configuration present"
    
    # Check for deployment artifacts
    if [ -d "$NOVA_DIR/.vercel" ] || [ -f "$NOVA_DIR/vercel/project.json" ]; then
        echo "   🚀 Vercel project configured"
    else
        echo "   ⚠️  Vercel not deployed yet"
        echo "   Run: vercel --prod"
    fi
else
    echo "   ❌ Vercel config missing - Ralph Loop should create"
fi

# 4. Check Payment Integration
echo "4. Checking payment integration..."
if [ -f "$NOVA_DIR/config/x402-payments.json" ]; then
    echo "   ✅ x402 payment configuration present"
    
    # Validate configuration
    CONFIG_VALID=$(jq -e '.pricing.shopify_skill_license.price_usdc' "$NOVA_DIR/config/x402-payments.json" 2>/dev/null || echo "invalid")
    if [ "$CONFIG_VALID" != "invalid" ]; then
        echo "   💰 Shopify license price: $CONFIG_VALID USDC"
    fi
else
    echo "   ❌ Payment config missing"
fi

# 5. Check Managed Hosting Scripts
echo "5. Checking managed hosting infrastructure..."
if [ -f "$NOVA_DIR/scripts/managed-hosting-setup.sh" ]; then
    SCRIPT_SIZE=$(wc -l < "$NOVA_DIR/scripts/managed-hosting-setup.sh")
    echo "   ✅ Managed hosting script: $SCRIPT_SIZE lines"
    
    # Check if script is executable
    if [ -x "$NOVA_DIR/scripts/managed-hosting-setup.sh" ]; then
        echo "   ✅ Script is executable"
    else
        echo "   ⚠️  Script not executable - run: chmod +x"
    fi
else
    echo "   ❌ Managed hosting script missing"
fi

# 6. System Health Check
echo "6. System health check..."
# Disk space
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}')
echo "   💾 Disk usage: $DISK_USAGE"

# Memory
MEM_USAGE=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
echo "   🧠 Memory usage: $MEM_USAGE"

# CPU (1-minute load)
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
echo "   ⚡ Load average: $LOAD_AVG"

# 7. Log Heartbeat
HEARTBEAT_LOG="$LOG_DIR/heartbeat-$(date +%Y%m%d).log"
{
    echo "=== Heartbeat $(date) ==="
    echo "Ralph Loop active: $SESSION_ACTIVE"
    echo "Git uncommitted: $GIT_STATUS"
    echo "Disk: $DISK_USAGE | Memory: $MEM_USAGE | Load: $LOAD_AVG"
    echo ""
} >> "$HEARTBEAT_LOG"

# 8. Auto-Restart Logic for Stalled Builds
if [ "$SESSION_ACTIVE" -eq 1 ]; then
    # Check if build has been active for too long (>8 hours)
    BUILD_START_FILE="$LOG_DIR/build-start.txt"
    if [ ! -f "$BUILD_START_FILE" ]; then
        date +%s > "$BUILD_START_FILE"
    fi
    
    BUILD_START=$(cat "$BUILD_START_FILE")
    CURRENT_TIME=$(date +%s)
    BUILD_DURATION=$((CURRENT_TIME - BUILD_START))
    
    if [ $BUILD_DURATION -gt 28800 ]; then  # 8 hours
        echo "   🚨 BUILD STALLED - Running for >8 hours"
        echo "   Build duration: $((BUILD_DURATION / 3600)) hours"
        echo "   Consider: Killing session and restarting"
        
        # Log critical alert
        echo "CRITICAL: Build stalled for >8 hours" >> "$LOG_DIR/alerts.log"
    fi
fi

# 9. Next Actions Summary
echo ""
echo "=== NEXT ACTIONS ==="

if [ "$SESSION_ACTIVE" -eq 0 ] && [ ! -f "$BUILD_DIR/SKILL.md" ]; then
    echo "1. Wait for Ralph Loop completion or restart build"
elif [ -f "$BUILD_DIR/SKILL.md" ]; then
    echo "1. Review Shopify skill build"
    echo "2. Test deployment to Vercel"
    echo "3. Set up payment webhooks"
fi

if [ "$GIT_STATUS" -gt 0 ]; then
    echo "4. Commit changes to GitHub"
fi

echo "5. Prepare ClawHub submission"
echo "6. Set up DNS for landing page (awaiting approval)"
echo ""

echo "=== HEARTBEAT COMPLETE ==="
echo "Next check in 30 minutes"
echo "Log: $HEARTBEAT_LOG"