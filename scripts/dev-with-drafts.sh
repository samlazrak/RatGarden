#!/bin/bash

# Quick development script that includes draft posts
# Usage: ./scripts/dev-with-drafts.sh

echo "🚀 Starting development server with drafts enabled..."
echo "📝 All posts marked with 'draft: true' will be visible"
echo ""

# Set environment variable to include drafts
export QUARTZ_INCLUDE_DRAFTS=true

# Run the full development workflow
npm run generate-graph-links
npm run kill
npm run build
npx quartz build --serve 