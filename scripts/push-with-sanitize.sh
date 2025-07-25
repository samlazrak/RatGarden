#!/bin/bash

# Script to push to private repo first, then sanitize and push to public repo
# This ensures the private repo is always updated before the public repo

set -e  # Exit on any error

echo "🚀 Starting push with sanitization process..."

# Get the current branch name
current_branch=$(git symbolic-ref HEAD | sed 's!refs/heads/!!')

# Only run sanitization when pushing to main branch
if [ "$current_branch" = "main" ]; then
  echo ""
  echo "📤 Step 1: Pushing to private repository..."
  
  # Push to private repo first
  if git push; then
    echo "✅ Successfully pushed to private repository"
    
    echo ""
    echo "🔄 Step 2: Running sanitization and push to public repository..."
    echo ""
    echo "📋 This will:"
    echo "   ✅ Exclude ALL content (private and public)"
    echo "   ✅ Exclude ALL build artifacts and cache files"
    echo "   ✅ Include only source code and configuration"
    echo "   ✅ Use Git LFS for large files"
    echo "   ✅ Use optimized git operations"
    echo ""

    # Run the TypeScript sanitization script in fast mode
    if npx tsx scripts/sanitize.ts --fast; then
      echo ""
      echo "✅ Sanitization and public push completed successfully"
      echo "🎉 Both private and public repositories are now up to date!"
    else
      echo ""
      echo "❌ Sanitization failed"
      echo "⚠️  Private repo was pushed successfully, but public repo was not updated"
      echo "💡 To retry the public push, run: npm run push-public"
      exit 1
    fi
  else
    echo "❌ Failed to push to private repository"
    echo "⚠️  Aborting sanitization process"
    exit 1
  fi
else
  echo "ℹ️  Not pushing to main branch, running normal push only..."
  git push
fi

echo ""
echo "✅ Push process completed successfully!" 