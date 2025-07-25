#!/bin/bash

# Test script for the sanitization system
# This script tests the sanitization process without actually pushing

set -e

echo "🧪 Testing sanitization system..."

# Test 1: Check if main script exists and is executable
if [ ! -f "scripts/sanitize-and-push.sh" ]; then
    echo "❌ Main script not found: scripts/sanitize-and-push.sh"
    exit 1
fi

if [ ! -x "scripts/sanitize-and-push.sh" ]; then
    echo "❌ Main script not executable: scripts/sanitize-and-push.sh"
    exit 1
fi

echo "✅ Main script exists and is executable"

# Test 2: Check if git hook exists and is executable
if [ ! -f ".git/hooks/pre-push" ]; then
    echo "❌ Git hook not found: .git/hooks/pre-push"
    exit 1
fi

if [ ! -x ".git/hooks/pre-push" ]; then
    echo "❌ Git hook not executable: .git/hooks/pre-push"
    exit 1
fi

echo "✅ Git hook exists and is executable"

# Test 3: Check if configuration file exists
if [ ! -f "scripts/sanitize-config.json" ]; then
    echo "❌ Configuration file not found: scripts/sanitize-config.json"
    exit 1
fi

echo "✅ Configuration file exists"

# Test 4: Test dry run
echo "🧪 Running dry run test..."
if ./scripts/sanitize-and-push.sh --dry-run --debug; then
    echo "✅ Dry run test passed"
else
    echo "❌ Dry run test failed"
    exit 1
fi

# Test 5: Check for required tools
echo "🔧 Checking required tools..."

# Check for jq (used for JSON parsing)
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found - configuration parsing may not work correctly"
    echo "   Install with: brew install jq"
else
    echo "✅ jq found"
fi

# Check for git
if ! command -v git &> /dev/null; then
    echo "❌ git not found"
    exit 1
else
    echo "✅ git found"
fi

# Test 6: Check for sensitive files that should be removed
echo "🔍 Checking for sensitive files..."

SENSITIVE_FILES=(
    "api/ai-assistant.js"
    ".env"
    ".env.local"
    "private/"
    "node_modules/"
    "public/"
    ".quartz-cache/"
    ".vscode/"
    ".claude/"
    ".idea/"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ Found sensitive file: $file (will be removed during sanitization)"
    else
        echo "ℹ️  Sensitive file not found: $file"
    fi
done

# Test 7: Check for draft posts
echo "📝 Checking for draft posts..."
DRAFT_COUNT=$(find content/ docs/ -name "*.md" -type f -exec grep -l "^draft: true" {} \; 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Found $DRAFT_COUNT draft posts (will be removed during sanitization)"

echo ""
echo "🎉 All tests passed! The sanitization system is ready to use."
echo ""
echo "Next steps:"
echo "1. Create the public repository: git@github.com:samlazrak/Digital-Garden.git"
echo "2. Ensure your SSH key is set up for both repositories"
echo "3. Push to main branch to trigger automatic sanitization"
echo ""
echo "To test manually:"
echo "  ./scripts/sanitize-and-push.sh --dry-run" 