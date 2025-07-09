# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Quartz 4** static site generator project for "The Rat's Garden" - a personal digital garden website. Quartz transforms Markdown content into a fully functional website with features like graph visualization, search, backlinks, and responsive design.

## Common Development Commands

### Build and Development
- `npm run dev` - Full development workflow: generates graph links, kills existing server, builds, and serves with hot reload
- `npm run build` - Build the static site 
- `npm run serve` - Serve the built site locally
- `npm run kill` - Kill any process running on port 8080

### Code Quality
- `npm run check` - Run TypeScript type checking and Prettier formatting check
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests using tsx

### Utility Commands
- `npm run generate-graph-links` - Generate invisible graph links in index.md to improve graph visualization
- `npm run docs` - Build and serve documentation from docs folder

## Architecture Overview

### Core Structure
- **Content**: Markdown files in `content/` directory containing the actual website content
- **Configuration**: `quartz.config.ts` defines site settings, plugins, and theme
- **Layout**: `quartz.layout.ts` defines component placement and page layouts
- **Components**: React/Preact components in `quartz/components/` for UI elements
- **Plugins**: Modular system in `quartz/plugins/` for transformers, filters, and emitters

### Key Components
- **Build System**: `quartz/build.ts` - Main build orchestration with hot reload support
- **Plugin System**: Three types of plugins:
  - Transformers: Process markdown content (syntax highlighting, frontmatter, etc.)
  - Filters: Remove or modify content before processing
  - Emitters: Generate output files (HTML pages, assets, etc.)

### Custom Features
- **Graph Link Generation**: `scripts/generate-graph-links.js` automatically adds invisible wikilinks to index.md to improve graph connectivity
- **Custom Components**: TwoColumnNotes, HomePageLinks, ConditionalRender for enhanced layouts
- **Theme Customization**: Custom color schemes and typography in quartz.config.ts

## Technical Stack
- **Runtime**: Node.js v22+ with npm v10.9.2+
- **Language**: TypeScript with JSX (Preact)
- **Build Tool**: Custom build system with esbuild
- **Styling**: SCSS with CSS custom properties
- **Content**: Markdown with frontmatter, supports Obsidian/GitHub flavored markdown

## Plugin Configuration
The site uses carefully configured plugins for:
- **ObsidianFlavoredMarkdown**: Wikilinks and callouts
- **GitHubFlavoredMarkdown**: Tables, strikethrough, task lists
- **SyntaxHighlighting**: Code blocks with github-light/dark themes
- **Latex**: Mathematical expressions with KaTeX
- **TableOfContents**: Automatic TOC generation
- **Graph**: Interactive knowledge graph visualization

## Development Workflow
1. Edit content in `content/` directory
2. Run `npm run dev` to start development server
3. Changes to content trigger automatic rebuild and browser refresh
4. Configuration changes require server restart

## Important Notes
- The site uses Preact instead of React for smaller bundle size
- Custom graph link generation script runs before each build to maintain graph connectivity
- Hot reload is implemented with WebSocket connections
- The site is configured for deployment at `garden.samlazrak.com`

## Writing Guidelines
- When writing for blog posts, especially for the RatGarden website, make it less verbose and generic-blog sounding