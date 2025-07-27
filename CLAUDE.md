# CLAUDE.md - Single Source of Truth

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🧠 Core Development Principles

**KEY PRINCIPLES**:

1. **Use sub-agents** for specialized tasks
2. **Separate planning from implementation**

## 🧠 Core Efficiency Principle: Planning vs Implementation Separation

**OPTIMAL APPROACH**:

- **Planning Phase**: Strategy, analysis, pattern identification, requirements gathering
- **Implementation Phase**: Coding, technical execution, debugging, file operations
- **Result**: Maximum efficiency - planning is cheaper, implementation is more expensive

**When to Use Each**:

- **Use planning for**: Strategy, analysis, pattern identification
- **Use implementation for**: Coding, technical execution
- **Avoid**: Doing implementation work during planning phase

## Project Overview

This is a **Quartz 4** static site generator project for "The Rat's Garden" - a personal digital garden website. Quartz transforms Markdown content into a fully functional website with features like graph visualization, search, backlinks, and responsive design.

**Key Features**:

- AI-powered search with semantic embeddings
- Interactive AI demos and writing assistants
- Medical citations and privacy analytics
- Canvas support for visual content
- Semantic link discovery and optimization
- Comprehensive testing with Vitest
- Automated sanitization for public deployment

## Common Development Commands

### Build and Development

- `npm run dev` - Full development workflow: generates graph links, kills existing server, builds, and serves with hot reload
- `npm run build` - Build the static site
- `npm run serve` - Serve the built site locally
- `npm run serve-auto` - Serve with automatic port selection
- `npm run kill` - Kill any process running on port 8080
- `npm run dev-with-private` - Development with private content included
- `npm run serve-with-private` - Serve with private content enabled
- `npm run test-server` - Test server for 15 seconds
- `npm run test-server-30s` - Test server for 30 seconds

### Code Quality

- `npm run check` - Run TypeScript type checking and Prettier formatting check
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests using Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage reporting

### Utility Commands

- `npm run generate-graph-links` - Generate invisible graph links in index.md to improve graph visualization
- `npm run generate-graph-links-legacy` - Legacy graph link generation method
- `npm run generate-graph-links-test` - Test different graph link generation methods
- `npm run docs` - Build and serve documentation from docs folder
- `npm run clear-semantic-cache` - Clear the semantic link cache
- `npm run setup-launchagent` - Setup macOS LaunchAgent for automated tasks
- `npm run cli` - Access CLI utilities for various tasks

### Repository Management

- `npm run sanitize` - Run sanitization process for public repository
- `npm run test-sanitization` - Test sanitization rules without applying them
- `npm run push-with-sanitize` - Push changes with automatic sanitization

### Claude Integration

- `npm run claude-daily` - Run daily Claude efficiency tracking
- `npm run claude-track` - Track token usage for efficiency analysis
- `npm run claude-report` - Generate efficiency reports
- `npm run claude-setup` - Setup Claude Code environment
- `npm run claude-mcp` - Setup MCP servers
- `npm run claude-init` - Initialize knowledge base
- `npm run claude-autopilot-setup` - Setup and configure Claude Autopilot integration

### Performance

- `npm run profile` - Profile build performance with 0x

## Architecture Overview

### Core Structure

- **Content**: Markdown files in `content/` directory containing the actual website content
- **Configuration**: `quartz.config.ts` defines site settings, plugins, and theme
- **Layout**: `quartz.layout.ts` defines component placement and page layouts
- **Components**: Preact components in `quartz/components/` for UI elements
- **Plugins**: Modular system in `quartz/plugins/` for transformers, filters, and emitters

### Key Components

- **Build System**: `quartz/build.ts` - Main build orchestration with hot reload support
- **Plugin System**: Three types of plugins:
  - Transformers: Process markdown content (syntax highlighting, frontmatter, etc.)
  - Filters: Remove or modify content before processing
  - Emitters: Generate output files (HTML pages, assets, etc.)

### Custom Features

- **AI Components**: AISearch, AIWritingAssistant, InteractiveAIDemo, AIRecommendations, MedicalCitations, PrivacyAnalytics with TensorFlow.js integration
- **Graph Link Generation**: Multiple approaches available:
  - `scripts/dev/hybrid-graph-links.ts` - Primary method combining multiple strategies
  - `scripts/dev/generate-graph-links.ts` - Legacy method
  - `scripts/dev/improved-graph-links.ts` - Enhanced version
- **Custom Layout Components**: TwoColumnNotes, HomePageLinks, ConditionalRender, CanvasViewer, ReadingProgress
- **Semantic Link Discovery**: Automatic semantic linking between related content with TensorFlow.js embeddings
- **Theme Customization**: Custom color schemes and typography in quartz.config.ts
- **Canvas Support**: Interactive canvas content with Pixi.js integration and .canvas file support
- **Notebook Integration**: Python notebook execution with custom transformer
- **Privacy-First Analytics**: Plausible integration with custom privacy controls

## Technical Stack

- **Runtime**: Node.js v22+ with npm v10.9.2+
- **Language**: TypeScript with JSX (Preact)
- **Build Tool**: Custom build system with esbuild and Lightning CSS
- **Styling**: SCSS with CSS custom properties
- **Content**: Markdown with frontmatter, supports Obsidian/GitHub flavored markdown
- **Testing**: Vitest with happy-dom for component testing, comprehensive coverage reporting
- **AI/ML**: TensorFlow.js, Universal Sentence Encoder for semantic search and embeddings
- **Graphics**: Pixi.js for canvas rendering, D3.js for data visualization
- **Analytics**: Plausible for privacy-focused analytics
- **Database**: SQLite3 for local caching and semantic data
- **Deployment**: Netlify with custom functions for AI features
- **Performance**: Workerpool for parallel processing, async-mutex for concurrency control

## Plugin Configuration

The site uses carefully configured plugins for:

### Core Plugins
- **ObsidianFlavoredMarkdown**: Wikilinks, callouts, and Obsidian syntax support
- **GitHubFlavoredMarkdown**: Tables, strikethrough, task lists
- **SyntaxHighlighting**: Code blocks with github-light/dark themes using Shiki
- **Latex**: Mathematical expressions with KaTeX
- **TableOfContents**: Automatic TOC generation with custom styling

### Custom Plugins
- **AI Search Index**: Enhanced search with AI capabilities using Universal Sentence Encoder
- **Semantic Link Config/Discovery**: Automated semantic relationships with TensorFlow.js
- **Canvas**: Interactive canvas content support with .canvas file processing
- **Notebook**: Python notebook execution and rendering
- **Citations**: Academic citation support with rehype-citation
- **Clickable Images**: Enhanced image interaction with zoom and navigation
- **Custom OG Images**: Dynamic Open Graph image generation with Satori

### Visual Features
- **Graph**: Interactive knowledge graph visualization with D3.js
- **Custom Components**: Reading progress, sidebar tabs, conditional rendering

## Development Workflow

1. **Content Development**: Edit content in `content/` directory (or `private/content/` for private content)
2. **Start Development**: Run `npm run dev` for standard development or `npm run dev-with-private` to include private content
3. **Hot Reload**: Changes to content trigger automatic rebuild and browser refresh via WebSocket
4. **Configuration Changes**: Require server restart - use `npm run kill` then restart
5. **Port Management**: Use `npm run serve-auto` for automatic port detection if 8080 is busy
6. **Testing**: Run `npm run test` for unit tests, `npm run test:coverage` for coverage reports
7. **Quality Checks**: Use `npm run check` for TypeScript and Prettier validation

## Code Style & Standards

- Use TypeScript with strict type checking for ALL new code
- Use Preact instead of React for all components
- Follow existing code patterns and file organization
- Use SCSS for styling with CSS custom properties
- Implement proper error boundaries and loading states
- Write comprehensive unit tests for all new code
- **NEVER create JavaScript files - always use TypeScript (.ts/.tsx)**
- Convert any existing JavaScript files to TypeScript when modifying them

## File Organization

- Components: `quartz/components/` with styles in `quartz/components/styles/`
- Scripts: `quartz/components/scripts/` for inline scripts
- Content: `content/` directory with appropriate subdirectories
- Tests: `tests/` directory or alongside components with `__tests__` folders
- Documentation: `docs/` directory for project documentation (NOT CLAUDE.md)
- Utility Scripts: `scripts/` directory for build and maintenance scripts
- **CLAUDE.md must remain in the root directory** - do not move it to docs/

## Repository Structure

### Private vs Public Content
- **Private Repository**: Contains all content, build artifacts, and development files
- **Public Repository**: Source code only - no content, build artifacts, or private files
- **Content Separation**: `content/` for public content, `private/content/` for private content
- **Sanitization**: Comprehensive sanitization system in `scripts/sanitize/` removes sensitive content
- **Testing**: `npm run test-sanitization` validates sanitization rules before applying

### File Management
- **Git LFS**: Large files (videos, images, JSON embeddings) handled by Git LFS
- **Build Artifacts**: All build outputs excluded from git via .gitignore
- **Cache Management**: Semantic cache and embeddings managed separately

## Git Operations - STRICT RULES

- **NEVER make git commits automatically** - only suggest commits to the user
- **NEVER push code automatically** - only suggest pushes to the user
- **NEVER run git commands without explicit user approval**
- **NEVER use sanitization scripts without user approval**
- **ALWAYS ask for permission before any git operations**
- **ONLY suggest changes and let the user execute them manually**
- **If git operations are needed, provide the exact commands for the user to run**

## Testing Requirements

- Write unit tests first (TDD)
- Include comprehensive error handling
- Validate all user inputs
- Mock external dependencies
- Test happy paths, edge cases, and error conditions
- Use Vitest with happy-dom for component testing
- Achieve good test coverage (aim for 80%+)

## Linter Error Handling

- **Maximum 3 attempts** to fix linter errors on the same file
- If linter errors persist after 3 attempts, stop and ask the user for guidance
- Do not make uneducated guesses and do not loop more than 3 times to fix linter errors on the same file
- Focus on clear, obvious fixes rather than complex type system changes
- When hitting the limit, provide a summary of the remaining issues to the user

## Important Implementation Details

### Framework Choices
- **Preact over React**: Smaller bundle size and better performance
- **esbuild**: Fast compilation with Lightning CSS for optimized styling
- **TypeScript Strict**: All new code must use TypeScript with strict type checking

### Build Process
- **Graph Links**: Hybrid graph link generation runs before each build for connectivity
- **Hot Reload**: WebSocket-based hot reload for content and component changes
- **Parallel Processing**: Workerpool for CPU-intensive tasks like embeddings
- **Caching**: Semantic cache system for faster subsequent builds

### Deployment
- **Production**: Deployed at garden.samlazrak.com via Netlify
- **Functions**: Serverless functions in `netlify/functions/` for AI features
- **Static Assets**: Optimized asset handling with custom emitters

### Performance Optimizations
- **Client-side AI**: TensorFlow.js for semantic search without server round-trips
- **Canvas Rendering**: Pixi.js for efficient interactive graphics
- **Lazy Loading**: Components and AI features load on demand
- **Code Splitting**: Modular architecture for optimal loading

## Sub-Agent Usage

### Available Sub-Agents

- **content-curator**: Content strategy and gap analysis
- **semantic-link-optimizer**: Content connectivity optimization
- **medical-content-assistant**: Medical terminology validation
- **test-generator**: Automated test creation
- **privacy-auditor**: Privacy and security review
- **unit-test-engineer**: Comprehensive test suite creation
- **code-reviewer**: Code review and best practices
- **software-architecture-expert**: System design and architecture
- **ai-ml-engineer-mentor**: AI/ML implementation guidance
- **professional-writer-career-advisor**: Technical writing and documentation
- **natural-writing-humanizer**: Content personalization

### When to Use Sub-Agents

- **Content Projects**: content-curator + semantic-link-optimizer
- **Code Review**: code-reviewer + test-generator
- **Architecture**: software-architecture-expert
- **Medical Content**: medical-content-assistant
- **AI Features**: ai-ml-engineer-mentor
- **Testing**: unit-test-engineer
- **Privacy**: privacy-auditor

### Sub-Agent Efficiency

- **Batch multiple agents** in single query when possible
- **Skip agents** for simple tasks (low ROI)
- **Use for specialized work** only

## Knowledge Base Integration

### Local Knowledge Base

- **Database**: `~/.claude-knowledge/db/claude-knowledge.db` for contexts and solutions
- **Purpose**: Gather intelligence to help Claude use fewer tokens
- **Usage**: Search before implementing, save patterns after success

### Essential Scripts (`.claude-scripts/`)

- **save-context.sh**: Save project context to database
- **load-context.sh**: Load previous project context
- **track-tokens.sh**: Track token usage for efficiency analysis

### Templates (`.claude-templates/`)

- **React/Preact**: `.claude-templates/react/component.tsx`
- **Python**: `.claude-templates/python/class.py`
- **Node.js**: `.claude-templates/node/component.js`

## Efficiency Targets

- **Minimum 25% token savings** through optimization
- **90% pattern reuse** for common tasks
- **80% sub-agent utilization** for specialized work
- **100% planning/implementation separation**

## Warning System

**WARN USER** if they violate efficiency principles:

- Creating new patterns when templates exist
- Not using sub-agents for specialized tasks
- Breaking related tasks into separate queries
- Ignoring documented solutions
- **Not separating planning from implementation**

**REMEMBER**: Every token saved is value preserved for future high-impact work. Efficiency is mandatory for maximum subscription value. The planning/implementation separation is key to maximum efficiency.

## Claude Autopilot Integration

### Overview

**Claude Autopilot** is a VS Code extension that enables 24/7 automated Claude Code task processing. It allows you to queue hundreds of tasks and let Claude work autonomously while you sleep, eat, or spend time with family.

### Key Features

- **24/7 Automated Processing**: Queue tasks and let Claude Autopilot work autonomously
- **Auto-Resume**: Automatically resumes when Claude usage limits reset
- **Sleep Prevention**: Keeps computer awake during overnight processing
- **Smart Queue Management**: Processes multiple tasks with intelligent queueing
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **IDE Compatibility**: Full support for VS Code and Cursor

### Setup and Installation

1. **Prerequisites**: Ensure Claude Code, Python 3.8+, VS Code/Cursor, and Node.js 22+ are installed
2. **Run Setup**: `npm run claude-autopilot-setup` - automated setup script that checks dependencies
3. **Install Extension**: Install Claude Autopilot from VS Code Marketplace or manually install VSIX
4. **Quick Start**: See `CLAUDE-AUTOPILOT-QUICKSTART.md` for detailed instructions

### Commands

- `Claude: Start Claude Autopilot` - Start the interface and session
- `Claude: Stop Claude Autopilot` - Stop processing and close session
- `Claude: Add Message to Queue` - Add new task to processing queue

### Integration with RatGarden

- **Automated Testing**: Queue comprehensive test generation for AI components
- **TypeScript Conversion**: Convert remaining JavaScript files to TypeScript
- **Documentation Updates**: Generate and update project documentation
- **Code Review**: Automated code review and optimization
- **Accessibility**: Add accessibility improvements across components
- **SCSS Refactoring**: Modernize styling and improve maintainability

### Configuration Files

- `.claude-autopilot-queue.json` - Task queue configuration (auto-generated)
- `.vscode/extensions.json` - Extension recommendations
- `.vscode/settings.json` - Claude Autopilot settings
- `.vscode/tasks.json` - Task definitions
- `Claude-Autopilot/` - Full extension source code and documentation

### Best Practices

- **Queue Management**: Add related tasks in batches for better context
- **Priority Setting**: Use high/medium/low priorities to organize work
- **Monitoring**: Check VS Code Output panel and processing history
- **Safety**: Only use in trusted development environments
- **Resource Management**: Ensure adequate disk space and memory for long runs

### Troubleshooting

- **Claude Code Not Found**: Ensure Claude Code is in PATH, restart VS Code
- **Python Issues**: Install Python 3.8+, ensure it's in PATH
- **Permission Errors**: Extension uses `--dangerously-skip-permissions` for automation
- **Processing Failures**: Check logs in VS Code Output panel for detailed error information
