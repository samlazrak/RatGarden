# CLAUDE.md - Single Source of Truth

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 MANDATORY: Pre-Session Checklist

**BEFORE RESPONDING TO ANY QUERY**, you MUST:

1. **Check `.claude/pre-inputs.md` FIRST** - Contains task completion status
2. **If `completed: false`** - Task is TOP PRIORITY, wait for user details
3. **If `completed: true`** - Proceed with user query
4. **Use sub-agents** for specialized tasks
5. **Separate planning from implementation**

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
- `npm run kill` - Kill any process running on port 8080
- `npm run dev-with-drafts` - Development with draft content included
- `npm run serve-with-drafts` - Serve with drafts enabled

### Code Quality

- `npm run check` - Run TypeScript type checking and Prettier formatting check
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests using Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage reporting

### Utility Commands

- `npm run generate-graph-links` - Generate invisible graph links in index.md to improve graph visualization
- `npm run docs` - Build and serve documentation from docs folder
- `npm run clear-semantic-cache` - Clear the semantic link cache
- `npm run sanitize` - Run sanitization process for public repository
- `npm run push-with-sanitize` - Push changes with automatic sanitization
- `npm run claude-daily` - Run daily Claude efficiency tracking
- `npm run claude-track` - Track token usage for efficiency analysis
- `npm run claude-report` - Generate efficiency reports
- `npm run claude-setup` - Setup Claude Code environment
- `npm run claude-mcp` - Setup MCP servers
- `npm run claude-init` - Initialize knowledge base

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

- **AI Components**: AISearch, AIWritingAssistant, InteractiveAIDemo, AIRecommendations, MedicalCitations, PrivacyAnalytics
- **Graph Link Generation**: `scripts/dev/generate-graph-links.ts` automatically adds invisible wikilinks to index.md
- **Custom Components**: TwoColumnNotes, HomePageLinks, ConditionalRender, CanvasViewer for enhanced layouts
- **Semantic Link Discovery**: Automatic semantic linking between related content with TensorFlow.js embeddings
- **Theme Customization**: Custom color schemes and typography in quartz.config.ts
- **Canvas Support**: Interactive canvas content with Pixi.js integration

## Technical Stack

- **Runtime**: Node.js v22+ with npm v10.9.2+
- **Language**: TypeScript with JSX (Preact)
- **Build Tool**: Custom build system with esbuild
- **Styling**: SCSS with CSS custom properties
- **Content**: Markdown with frontmatter, supports Obsidian/GitHub flavored markdown
- **Testing**: Vitest with happy-dom for component testing
- **AI/ML**: TensorFlow.js, Universal Sentence Encoder for semantic search
- **Graphics**: Pixi.js for canvas rendering, D3.js for data visualization
- **Analytics**: Plausible for privacy-focused analytics

## Plugin Configuration

The site uses carefully configured plugins for:

- **ObsidianFlavoredMarkdown**: Wikilinks and callouts
- **GitHubFlavoredMarkdown**: Tables, strikethrough, task lists
- **SyntaxHighlighting**: Code blocks with github-light/dark themes
- **Latex**: Mathematical expressions with KaTeX
- **TableOfContents**: Automatic TOC generation
- **Graph**: Interactive knowledge graph visualization
- **AI Search Index**: Enhanced search with AI capabilities using Universal Sentence Encoder
- **Semantic Link Config/Discovery**: Automated semantic relationships with TensorFlow.js
- **Canvas**: Interactive canvas content support
- **Custom OG Images**: Dynamic Open Graph image generation

## Development Workflow

1. Edit content in `content/` directory
2. Run `npm run dev` to start development server
3. Changes to content trigger automatic rebuild and browser refresh
4. Configuration changes require server restart
5. Use `npm run dev-with-drafts` to include draft content during development

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

## Repository Management

- **Private Repository**: Contains all content, build artifacts, and development files
- **Public Repository**: Source code only - no content, build artifacts, or private files
- **Sanitization**: Automatic sanitization system removes sensitive content before public pushes
- **Git LFS**: Large files (videos, images, JSON) are handled by Git LFS for faster pushes

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

## Important Notes

- The site uses Preact instead of React for smaller bundle size
- Custom graph link generation script runs before each build to maintain graph connectivity
- Hot reload via WebSocket connections
- Deployed at garden.samlazrak.com
- AI features use TensorFlow.js for client-side semantic search
- Canvas content is supported with Pixi.js integration

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
- **100% pre-inputs.md compliance**
- **100% planning/implementation separation**

## Warning System

**WARN USER** if they violate efficiency principles:

- Creating new patterns when templates exist
- Not using sub-agents for specialized tasks
- Breaking related tasks into separate queries
- Ignoring documented solutions
- **Not separating planning from implementation**

**REMEMBER**: Every token saved is value preserved for future high-impact work. Efficiency is mandatory for maximum subscription value. The planning/implementation separation is key to maximum efficiency.
