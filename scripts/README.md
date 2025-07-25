# Scripts Directory Documentation

This directory contains various utility scripts for development, testing, debugging, and deployment of the RatGarden digital garden.

## 📁 Script Categories

### 🔒 Sanitization & Deployment Scripts

#### `sanitize.ts` - Main Sanitization Engine

- **Type**: TypeScript
- **Purpose**: Creates a sanitized version of the private repository for public showcase
- **Features**:
  - Removes sensitive content (API keys, private files, drafts)
  - Excludes build artifacts and cache files
  - Creates enhanced `.gitignore` for public repo
  - Handles Git operations with user confirmation
  - Supports dry-run mode for testing
- **Usage**: `npx tsx scripts/sanitize.ts [--dry-run] [--fast] [--debug]`

#### `sanitize-config.json` - Sanitization Configuration

- **Type**: JSON
- **Purpose**: Configuration file for the sanitization process
- **Configurable Items**:
  - Public repository URL
  - Files and patterns to exclude
  - Git configuration
  - Content sanitization rules

#### `push-with-sanitize.sh` - Automated Push Workflow

- **Type**: Bash Shell Script
- **Purpose**: Orchestrates the complete push workflow
- **Process**:
  1. Pushes to private repository first
  2. Runs sanitization script in fast mode
  3. Pushes sanitized version to public repository
- **Usage**: `./scripts/push-with-sanitize.sh`

#### `test-sanitization.ts` - Sanitization Testing Suite

- **Type**: TypeScript
- **Purpose**: Comprehensive testing of the sanitization system
- **Tests**:
  - Script existence and accessibility
  - Git hook configuration
  - Configuration file validation
  - Dry-run functionality
  - Required tools availability
  - Sensitive file detection
  - Draft post identification
- **Usage**: `npx tsx scripts/test-sanitization.ts`

### 🚀 Development & Build Scripts

#### `dev-with-drafts.sh` - Development Server with Drafts

- **Type**: Bash Shell Script
- **Purpose**: Starts development server with draft posts included
- **Process**:
  - Sets `QUARTZ_INCLUDE_DRAFTS=true` environment variable
  - Generates graph links
  - Kills existing processes
  - Builds the site
  - Starts development server
- **Usage**: `./scripts/dev-with-drafts.sh`

#### `generate-graph-links.js` - Graph Link Generator

- **Type**: JavaScript (ES Modules)
- **Purpose**: Automatically generates graph links for Quartz
- **Features**:
  - Scans all markdown files recursively
  - Adds invisible graph links to index.md files
  - Updates existing graph link sections
  - Skips `.obsidian` directories
- **Usage**: `node scripts/generate-graph-links.js`

#### `clear-semantic-cache.js` - Semantic Cache Cleaner

- **Type**: JavaScript (ES Modules)
- **Purpose**: Clears the semantic analysis cache
- **Process**:
  - Removes `.quartz-cache/semantic/` directory
  - Handles missing cache gracefully
  - Provides clear feedback
- **Usage**: `node scripts/clear-semantic-cache.js`

#### `setup-launchagent.sh` - macOS Launch Agent Setup

- **Type**: Bash Shell Script
- **Purpose**: Sets up Quartz development server as a macOS launch agent
- **Process**:
  - Copies plist file to LaunchAgents directory
  - Unloads existing agent if present
  - Loads the new agent
- **Usage**: `./scripts/setup-launchagent.sh`

### 🔧 Debug & Testing Scripts

#### `debug_component_resources.cjs` - Component Resource Debugger

- **Type**: CommonJS JavaScript
- **Purpose**: Debug component CSS files and SCSS compilation
- **Features**:
  - Scans all component SCSS files
  - Identifies problematic patterns (standalone `$` characters)
  - Tests SCSS compilation for each file
  - Reports compilation errors
- **Usage**: `node scripts/debug_component_resources.cjs`

#### `test_build_css.cjs` - CSS Build Process Tester

- **Type**: CommonJS JavaScript
- **Purpose**: Tests the complete CSS build process
- **Process**:
  - Compiles main SCSS files (custom, popover, semantic links)
  - Joins CSS files as the build process does
  - Tests lightningcss transformation
  - Writes debug output to `debug_joined_css.css`
  - Validates browser compatibility targets
- **Usage**: `node scripts/test_build_css.cjs`

#### `test_scss.cjs` - Individual SCSS File Tester

- **Type**: CommonJS JavaScript
- **Purpose**: Tests individual SCSS files for compilation errors
- **Files Tested**:
  - `quartz/styles/custom.scss`
  - `quartz/components/styles/semanticLinks.scss`
  - `quartz/styles/base.scss`
  - `quartz/styles/variables.scss`
  - `quartz/styles/themes/_index.scss`
- **Features**:
  - Individual file compilation testing
  - Suspicious pattern detection
  - Detailed error reporting
- **Usage**: `node scripts/test_scss.cjs`

#### `test_transform.cjs` - CSS Transform Tester

- **Type**: CommonJS JavaScript
- **Purpose**: Tests lightningcss transformation process
- **Process**:
  - Compiles SCSS to CSS
  - Applies lightningcss transformation
  - Tests minification
  - Validates browser targets
- **Usage**: `node scripts/test_transform.cjs`

#### `debug_css.cjs` - CSS Output Debugger

- **Type**: CommonJS JavaScript
- **Purpose**: Debugs CSS compilation output
- **Features**:
  - Compiles main SCSS file
  - Writes output to `debug_output.css`
  - Identifies suspicious dollar sign patterns
  - Reports problematic lines
- **Usage**: `node scripts/debug_css.cjs`

### 📄 Debug Output Files

#### `debug_joined_css.css` - Joined CSS Debug Output

- **Generated by**: `test_build_css.cjs`
- **Purpose**: Contains the joined CSS output for inspection
- **Size**: ~93KB (2,932 lines)

#### `debug_output.css` - CSS Compilation Debug Output

- **Generated by**: `debug_css.cjs`
- **Purpose**: Contains the compiled CSS output for debugging
- **Size**: ~83KB (2,554 lines)

## 🛠️ Script Usage Patterns

### Development Workflow

```bash
# Start development with drafts
./scripts/dev-with-drafts.sh

# Generate graph links
node scripts/generate-graph-links.js

# Clear semantic cache if needed
node scripts/clear-semantic-cache.js
```

### Debugging CSS Issues

```bash
# Test individual SCSS files
node scripts/test_scss.cjs

# Test complete build process
node scripts/test_build_css.cjs

# Debug component resources
node scripts/debug_component_resources.cjs

# Debug CSS output
node scripts/debug_css.cjs
```

### Sanitization & Deployment

```bash
# Test sanitization system
npx tsx scripts/test-sanitization.ts

# Run sanitization dry-run
npx tsx scripts/sanitize.ts --dry-run

# Push with automatic sanitization
./scripts/push-with-sanitize.sh
```

## 🔧 Script Dependencies

### Node.js Scripts

- **ES Modules**: `generate-graph-links.js`, `clear-semantic-cache.js`
- **CommonJS**: All `.cjs` files
- **TypeScript**: `sanitize.ts`, `test-sanitization.ts`

### External Dependencies

- **sass**: SCSS compilation (used in debug scripts)
- **lightningcss**: CSS transformation and minification
- **glob**: File pattern matching (used in sanitize.ts)
- **tsx**: TypeScript execution

### Shell Scripts

- **Bash**: All `.sh` files
- **macOS**: `setup-launchagent.sh` (macOS-specific)

## 🚨 Important Notes

### File Extensions

- **`.js`**: ES Module JavaScript files
- **`.cjs`**: CommonJS JavaScript files (for Node.js compatibility)
- **`.ts`**: TypeScript files
- **`.sh`**: Bash shell scripts

### Debug Files

- Debug output files (`debug_*.css`) are generated during troubleshooting
- These files can be large and should be cleaned up after debugging
- They are excluded from the public repository via sanitization

### Security

- Sanitization scripts handle sensitive data removal
- Always test with `--dry-run` before actual deployment
- Review sanitized output before pushing to public repository

## 🔄 Maintenance

### Regular Tasks

- Clear debug output files periodically
- Update sanitization patterns as needed
- Test sanitization system after major changes
- Review and update script dependencies

### Troubleshooting

- Use debug scripts to identify CSS compilation issues
- Check sanitization logs for excluded files
- Verify Git hooks are properly configured
- Test all scripts after dependency updates
