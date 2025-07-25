#!/bin/bash

# Sanitize and Push Script for RatGarden to Digital-Garden
# This script creates a sanitized version of the private RatGarden repo
# and pushes it to the public Digital-Garden repo for showcasing

set -e  # Exit on any error

# Parse command line arguments
DRY_RUN=false
DEBUG=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --dry-run    Run sanitization without pushing"
            echo "  --debug      Enable debug output"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Configuration
PRIVATE_REPO_PATH="$(pwd)"
CONFIG_FILE="scripts/sanitize-config.json"

# Load configuration if it exists
if [ -f "$CONFIG_FILE" ]; then
    PUBLIC_REPO_URL=$(jq -r '.publicRepoUrl' "$CONFIG_FILE" 2>/dev/null || echo "git@github.com:samlazrak/Digital-Garden.git")
    BRANCH_NAME=$(jq -r '.branchName' "$CONFIG_FILE" 2>/dev/null || echo "main")
    GIT_USER_NAME=$(jq -r '.gitConfig.userName' "$CONFIG_FILE" 2>/dev/null || echo "RatGarden Sanitizer")
    GIT_USER_EMAIL=$(jq -r '.gitConfig.userEmail' "$CONFIG_FILE" 2>/dev/null || echo "sanitizer@ratgarden.local")
else
    PUBLIC_REPO_URL="git@github.com:samlazrak/Digital-Garden.git"
    BRANCH_NAME="main"
    GIT_USER_NAME="RatGarden Sanitizer"
    GIT_USER_EMAIL="sanitizer@ratgarden.local"
fi

TEMP_DIR="/tmp/ratgarden-sanitized-$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        log_info "Cleaning up temporary directory..."
        rm -rf "$TEMP_DIR"
    fi
}

# Set up cleanup on script exit
trap cleanup EXIT

log_info "Starting sanitization and push process..."

if [ "$DEBUG" = true ]; then
    log_info "DEBUG: Configuration loaded:"
    log_info "  Public Repo URL: $PUBLIC_REPO_URL"
    log_info "  Branch Name: $BRANCH_NAME"
    log_info "  Git User: $GIT_USER_NAME <$GIT_USER_EMAIL>"
    log_info "  Dry Run: $DRY_RUN"
fi

# Create temporary directory
log_info "Creating temporary directory: $TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Clone the current repo to temp directory
log_info "Creating sanitized copy of repository..."
cp -r "$PRIVATE_REPO_PATH" "$TEMP_DIR/"
cd "$TEMP_DIR/RatGarden"

# Remove .git directory to start fresh
rm -rf .git

# Remove build artifacts and dependencies that shouldn't be in public repo
log_info "Removing build artifacts and dependencies..."
rm -rf node_modules/
rm -rf public/
rm -rf .quartz-cache/
rm -rf coverage/
rm -rf .nyc_output/
rm -rf temp/
rm -rf tmp/
rm -f tsconfig.tsbuildinfo
rm -f *.log
rm -f *.tgz

# Remove IDE and development-specific directories that shouldn't be in public repo
log_info "Removing IDE and development-specific directories..."
rm -rf .vscode/
rm -rf .claude/
rm -rf .idea/

# Remove development and debug files
log_info "Removing development and debug files..."
rm -f debug_*.cjs
rm -f test_*.cjs
rm -f debug_*.css
rm -f debug_*.js
rm -f homebrew.mxcl.quartz.plist
rm -f setup-launchagent.sh

# Remove internal documentation and conversation logs
log_info "Removing internal documentation..."
rm -f CLAUDE.md
rm -f CURSOR.md
rm -f DRAFT_MANAGEMENT.md

# Remove potentially sensitive configuration files
log_info "Removing sensitive configuration files..."
rm -f package-lock.json
rm -f .npmrc
rm -f .node-version
rm -f vercel.json

# Initialize new git repository
git init
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"

# Create comprehensive .gitignore for public repo
log_info "Creating enhanced .gitignore for public repo..."

# Start with the existing .gitignore and enhance it
if [ -f "$PRIVATE_REPO_PATH/.gitignore" ]; then
    cp "$PRIVATE_REPO_PATH/.gitignore" .gitignore
    echo "" >> .gitignore
    echo "# Enhanced exclusions for public repository" >> .gitignore
else
    # Create a basic .gitignore if none exists
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
public/
prof/
.quartz-cache/
tsconfig.tsbuildinfo

# System files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE/Editor
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Replit
.replit
replit.nix
EOF
fi

# Add additional security exclusions for public repo
cat >> .gitignore << 'EOF'

# Enhanced exclusions for public repository
# Environment files and secrets
.env
.env.*
*.env
secrets/
secret/
private/
private-keys/
api-keys/

# IDE and development-specific directories (keep in private repo only)
.vscode/
.claude/
.idea/

# Development and debug files
debug_*.cjs
test_*.cjs
debug_*.css
debug_*.js
homebrew.mxcl.quartz.plist
setup-launchagent.sh

# Internal documentation and conversation logs
CLAUDE.md
CURSOR.md
DRAFT_MANAGEMENT.md

# Sensitive configuration files
package-lock.json
.npmrc
.node-version
vercel.json

# Temporary files
temp/
tmp/

# Cache directories
.cache/
cache/

# Local configuration files
config.local.*
*.local.*

# Backup files
*.bak
*.backup
*~

# Test files that might contain sensitive data
test-secrets.*
*secret*.test.*

# Additional security exclusions
*.key
*.pem
*.p12
*.pfx
*.crt
*.cert
config.json
secrets.json
credentials.json

# Remove sensitive files and directories
log_info "Removing sensitive files and directories..."

# Remove API files that might contain secrets
if [ -f "api/ai-assistant.js" ]; then
    log_warning "Removing api/ai-assistant.js (contains API keys)"
    rm -f api/ai-assistant.js
fi

# Remove any .env files
find . -name ".env*" -type f -delete
find . -name "*.env" -type f -delete

# Remove private directory
if [ -d "private" ]; then
    log_warning "Removing private/ directory"
    rm -rf private/
fi

# Remove draft posts
log_info "Removing draft posts..."
find content/ -name "*.md" -type f -exec grep -l "^draft: true" {} \; | while read -r file; do
    log_warning "Removing draft post: $file"
    rm -f "$file"
done

# Remove draft posts from docs directory
find docs/ -name "*.md" -type f -exec grep -l "^draft: true" {} \; | while read -r file; do
    log_warning "Removing draft post: $file"
    rm -f "$file"
done

# Sanitize configuration files
log_info "Sanitizing configuration files..."

# Create sanitized quartz.config.ts
if [ -f "quartz.config.ts" ]; then
    log_info "Sanitizing quartz.config.ts..."
    # Remove any API keys or sensitive configuration
    sed -i.bak '/apiKey/d' quartz.config.ts
    sed -i.bak '/OPENAI_API_KEY/d' quartz.config.ts
    sed -i.bak '/process\.env\./d' quartz.config.ts
    rm -f quartz.config.ts.bak
fi

# Remove any files that might contain API keys or secrets
log_info "Scanning for potential secret files..."
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.json" \) -not -path "./node_modules/*" | while read -r file; do
    if grep -q "api_key\|apiKey\|API_KEY\|secret\|password\|token" "$file" 2>/dev/null; then
        log_warning "Found potential secrets in: $file"
        # Remove lines containing potential secrets
        sed -i.bak '/api_key\|apiKey\|API_KEY\|secret\|password\|token/d' "$file" 2>/dev/null || true
        rm -f "$file.bak" 2>/dev/null || true
    fi
done

# Remove test files that might contain sensitive data
find . -type f \( -name "*test*" -o -name "*Test*" \) \( -name "*.js" -o -name "*.ts" \) -not -path "./node_modules/*" | while read -r file; do
    if grep -q "OPENAI_API_KEY\|api_key\|secret" "$file" 2>/dev/null; then
        log_warning "Removing test file with potential secrets: $file"
        rm -f "$file"
    fi
done

# Create a README for the public repo
log_info "Creating public README..."
cat > README_PUBLIC.md << 'EOF'
# Digital Garden - Showcase Version

This is a sanitized version of my private digital garden repository, created for showcasing purposes.

## What's Included

- All public content from the original repository
- Complete Quartz 4 static site generator setup
- Custom components and styling
- AI-powered features and integrations
- Build and deployment configuration

## What's Excluded

- Draft posts and private content
- API keys and sensitive configuration
- Environment files and secrets
- Private notes and personal data

## Features

- **AI-Powered Search**: Semantic search with embeddings
- **Interactive Demos**: AI-assisted writing and recommendations
- **Modern UI**: Responsive design with dark/light mode
- **Graph View**: Interactive knowledge graph
- **Full-Text Search**: Fast content discovery
- **RSS Feed**: Content syndication
- **Social Images**: Auto-generated preview images

## Technology Stack

- **Framework**: Quartz 4 (Hugo-based static site generator)
- **Frontend**: TypeScript, Preact, SCSS
- **AI Integration**: OpenAI API, semantic embeddings
- **Build System**: esbuild, Node.js
- **Deployment**: Vercel

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## License

This showcase version is provided for demonstration purposes only.
EOF

# Replace the main README with the public version
if [ -f "README_PUBLIC.md" ]; then
    mv README_PUBLIC.md README.md
else
    log_warning "README_PUBLIC.md not found, keeping existing README.md"
fi

# Add all files to git
log_info "Adding files to git..."
git add .

# Commit the sanitized version
log_info "Creating commit..."
git commit -m "Sanitized version for public showcase

- Removed draft posts and private content
- Sanitized configuration files
- Removed API keys and sensitive data
- Updated README for public consumption

Generated by sanitize-and-push.sh on $(date)"

# Add the public repo as remote
log_info "Adding public repository as remote..."
git remote add public "$PUBLIC_REPO_URL"

# Push to public repo
if [ "$DRY_RUN" = true ]; then
    log_info "DRY RUN: Would push to public repository: $PUBLIC_REPO_URL"
    log_success "Dry run completed successfully!"
    log_info "To actually push, run without --dry-run flag"
else
    log_info "Pushing to public repository..."
    if git push public main:main --force; then
        log_success "Successfully pushed sanitized version to public repository!"
    else
        log_error "Failed to push to public repository"
        exit 1
    fi
    
    log_success "Sanitization and push process completed successfully!"
    log_info "Public repository: $PUBLIC_REPO_URL"
fi 