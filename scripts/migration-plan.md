# Script Migration Plan: Shell Scripts to TypeScript

This document outlines a comprehensive plan to migrate all shell scripts and JavaScript files in the scripts directory to TypeScript, improving type safety, maintainability, and consistency across the codebase.

## Current State Analysis

### Shell Scripts (.sh files)

#### `dev-with-drafts.sh`

- **Purpose**: Development server startup with drafts enabled
- **Complexity**: Low (17 lines)
- **Dependencies**: npm, environment variables
- **Migration Priority**: Medium

#### `push-with-sanitize.sh`

- **Purpose**: Orchestrates push workflow with sanitization
- **Complexity**: Medium (56 lines)
- **Dependencies**: git, npx tsx, sanitize.ts
- **Migration Priority**: High

#### `setup-launchagent.sh`

- **Purpose**: macOS launch agent setup
- **Complexity**: Low (9 lines)
- **Dependencies**: macOS-specific commands
- **Migration Priority**: Low

### JavaScript Files (.js files)

#### `generate-graph-links.js`

- **Purpose**: Graph link generation for Quartz
- **Complexity**: Medium (138 lines)
- **Dependencies**: fs, path, ES modules
- **Migration Priority**: High

#### `clear-semantic-cache.js`

- **Purpose**: Semantic cache clearing
- **Complexity**: Low (31 lines)
- **Dependencies**: fs, path, ES modules
- **Migration Priority**: Medium

### CommonJS Files (.cjs files)

#### `debug_component_resources.cjs`

- **Purpose**: Debug component CSS files and SCSS compilation
- **Complexity**: Medium (55 lines)
- **Dependencies**: fs, path, sass
- **Migration Priority**: Medium

#### `test_build_css.cjs`

- **Purpose**: Test complete CSS build process
- **Complexity**: High (76 lines)
- **Dependencies**: fs, sass, lightningcss
- **Migration Priority**: High

#### `test_scss.cjs`

- **Purpose**: Test individual SCSS files
- **Complexity**: Medium (43 lines)
- **Dependencies**: fs, sass
- **Migration Priority**: Medium

#### `test_transform.cjs`

- **Purpose**: Test lightningcss transformation
- **Complexity**: Medium (36 lines)
- **Dependencies**: fs, sass, lightningcss
- **Migration Priority**: Medium

#### `debug_css.cjs`

- **Purpose**: Debug CSS compilation output
- **Complexity**: Low (20 lines)
- **Dependencies**: fs, sass
- **Migration Priority**: Low

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 TypeScript Configuration

```typescript
// scripts/tsconfig.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./",
    "module": "ESNext",
    "target": "ES2020",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": [
    "*.ts",
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "*.cjs",
    "*.js"
  ]
}
```

#### 1.2 Package.json Scripts

```json
{
  "scripts": {
    "scripts:build": "tsc -p scripts/tsconfig.json",
    "scripts:dev": "tsc -p scripts/tsconfig.json --watch",
    "scripts:test": "jest scripts/__tests__",
    "scripts:lint": "eslint scripts/**/*.ts",
    "scripts:format": "prettier --write scripts/**/*.ts"
  }
}
```

#### 1.3 Shared Utilities

```typescript
// scripts/utils/logger.ts
export interface Logger {
  info(message: string): void
  success(message: string): void
  warning(message: string): void
  error(message: string): void
  debug(message: string): void
}

export class ConsoleLogger implements Logger {
  private colors = {
    info: "\x1b[34m",
    success: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m",
    debug: "\x1b[35m",
    reset: "\x1b[0m",
  }

  private prefixes = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    debug: "🐛",
  }

  info(message: string): void {
    console.log(`${this.colors.info}${this.prefixes.info}${this.colors.reset} ${message}`)
  }

  success(message: string): void {
    console.log(`${this.colors.success}${this.prefixes.success}${this.colors.reset} ${message}`)
  }

  warning(message: string): void {
    console.log(`${this.colors.warning}${this.prefixes.warning}${this.colors.reset} ${message}`)
  }

  error(message: string): void {
    console.log(`${this.colors.error}${this.prefixes.error}${this.colors.reset} ${message}`)
  }

  debug(message: string): void {
    console.log(`${this.colors.debug}${this.prefixes.debug}${this.colors.reset} ${message}`)
  }
}
```

```typescript
// scripts/utils/file-system.ts
import { promises as fs } from "fs"
import { join, dirname, basename } from "path"
import { glob } from "glob"

export interface FileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  mkdir(path: string, recursive?: boolean): Promise<void>
  rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>
  glob(pattern: string): Promise<string[]>
}

export class NodeFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, "utf8")
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.mkdir(dirname(path), { recursive: true })
    return fs.writeFile(path, content, "utf8")
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  async mkdir(path: string, recursive = false): Promise<void> {
    return fs.mkdir(path, { recursive })
  }

  async rm(path: string, options: { recursive?: boolean; force?: boolean } = {}): Promise<void> {
    return fs.rm(path, options)
  }

  async glob(pattern: string): Promise<string[]> {
    return glob(pattern)
  }
}
```

```typescript
// scripts/utils/git.ts
import { execSync } from "child_process"

export interface GitOperations {
  getCurrentBranch(): string
  push(remote?: string, branch?: string): void
  add(files: string[]): void
  commit(message: string): void
  clone(url: string, path: string): void
  init(): void
  remoteAdd(name: string, url: string): void
}

export class GitOperationsImpl implements GitOperations {
  getCurrentBranch(): string {
    return execSync('git symbolic-ref HEAD | sed "s!refs/heads/!!"', { encoding: "utf8" }).trim()
  }

  push(remote = "origin", branch?: string): void {
    const cmd = branch ? `git push ${remote} ${branch}` : "git push"
    execSync(cmd, { stdio: "inherit" })
  }

  add(files: string[]): void {
    execSync(`git add ${files.join(" ")}`, { stdio: "inherit" })
  }

  commit(message: string): void {
    execSync(`git commit -m "${message}"`, { stdio: "inherit" })
  }

  clone(url: string, path: string): void {
    execSync(`git clone ${url} ${path}`, { stdio: "inherit" })
  }

  init(): void {
    execSync("git init", { stdio: "inherit" })
  }

  remoteAdd(name: string, url: string): void {
    execSync(`git remote add ${name} ${url}`, { stdio: "inherit" })
  }
}
```

### Phase 2: JavaScript to TypeScript Migration (Week 2)

#### 2.1 Generate Graph Links Migration

```typescript
// scripts/generate-graph-links.ts
import { FileSystem, NodeFileSystem } from "./utils/file-system"
import { Logger, ConsoleLogger } from "./utils/logger"
import { join, dirname, basename } from "path"

interface GraphLinkGeneratorConfig {
  contentDir: string
  logger?: Logger
  fileSystem?: FileSystem
}

export class GraphLinkGenerator {
  private config: GraphLinkGeneratorConfig
  private logger: Logger
  private fileSystem: FileSystem

  constructor(config: GraphLinkGeneratorConfig) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.fileSystem = config.fileSystem || new NodeFileSystem()
  }

  async generateGraphLinks(): Promise<void> {
    this.logger.info("Starting graph link generation...")

    try {
      const markdownFiles = await this.getMarkdownFiles(this.config.contentDir)
      const indexFiles = markdownFiles.filter((file) => basename(file) === "index.md")

      for (const indexFile of indexFiles) {
        await this.processIndexFile(indexFile, markdownFiles)
      }

      this.logger.success("Graph link generation completed successfully")
    } catch (error) {
      this.logger.error(`Graph link generation failed: ${error}`)
      throw error
    }
  }

  private async getMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = []
    const items = await this.fileSystem.glob(join(dir, "**/*.md"))

    for (const item of items) {
      const relativePath = item.replace(dir, "").replace(/^\//, "")
      const pathParts = relativePath.split("/")

      // Skip .obsidian directory
      if (pathParts.includes(".obsidian")) {
        continue
      }

      files.push(item)
    }

    return files
  }

  private async processIndexFile(indexFile: string, allMarkdownFiles: string[]): Promise<void> {
    const relativePath = indexFile.replace(this.config.contentDir, "").replace(/^\//, "")
    this.logger.info(`Processing ${relativePath}`)

    try {
      const content = await this.fileSystem.readFile(indexFile)
      const updatedContent = this.updateGraphLinksSection(content, allMarkdownFiles)

      if (updatedContent !== content) {
        await this.fileSystem.writeFile(indexFile, updatedContent)
        this.logger.success(`Updated graph links in ${relativePath}`)
      } else {
        this.logger.info(`No changes needed for ${relativePath}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process ${relativePath}: ${error}`)
    }
  }

  private updateGraphLinksSection(content: string, markdownFiles: string[]): string {
    const frontmatterEnd = content.indexOf("---", 3)
    if (frontmatterEnd === -1) {
      this.logger.warning("No frontmatter found, skipping")
      return content
    }

    const graphLinksSection = this.generateGraphLinksSection(markdownFiles)

    if (content.includes("<!-- Graph links - invisible but parsed by Quartz -->")) {
      return this.updateExistingGraphLinks(content, graphLinksSection)
    } else {
      return this.insertNewGraphLinks(content, frontmatterEnd, graphLinksSection)
    }
  }

  private generateGraphLinksSection(markdownFiles: string[]): string {
    const links = markdownFiles
      .map((filePath) => {
        const relativePath = filePath.replace(this.config.contentDir, "").replace(/^\//, "")
        const linkPath = relativePath.replace(/\.md$/, "")
        return `[[${linkPath}]]`
      })
      .join("\n")

    return `<!-- Graph links - invisible but parsed by Quartz -->
<div style="font-size: 0px; color: transparent; height: 0; overflow: hidden;">

${links}

</div>`
  }

  private updateExistingGraphLinks(content: string, newGraphLinksSection: string): string {
    const beforeGraphLinks = content.substring(
      0,
      content.indexOf("<!-- Graph links - invisible but parsed by Quartz -->"),
    )
    const afterGraphLinks = content.substring(
      content.indexOf(
        "</div>",
        content.indexOf("<!-- Graph links - invisible but parsed by Quartz -->"),
      ) + 6,
    )

    const remainingFrontmatterEnd = beforeGraphLinks.indexOf("---", 3)
    if (remainingFrontmatterEnd !== -1) {
      const beforeFrontmatter = beforeGraphLinks.substring(0, remainingFrontmatterEnd + 3)
      return beforeFrontmatter + "\n\n" + newGraphLinksSection + afterGraphLinks
    } else {
      return beforeGraphLinks + "\n\n" + newGraphLinksSection + afterGraphLinks
    }
  }

  private insertNewGraphLinks(
    content: string,
    frontmatterEnd: number,
    graphLinksSection: string,
  ): string {
    const beforeFrontmatter = content.substring(0, frontmatterEnd + 3)
    const afterFrontmatter = content.substring(frontmatterEnd + 3)
    return beforeFrontmatter + "\n\n" + graphLinksSection + afterFrontmatter
  }
}

// CLI entry point
async function main(): Promise<void> {
  const generator = new GraphLinkGenerator({
    contentDir: join(process.cwd(), "content"),
  })

  await generator.generateGraphLinks()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Graph link generation failed:", error)
    process.exit(1)
  })
}
```

#### 2.2 Clear Semantic Cache Migration

```typescript
// scripts/clear-semantic-cache.ts
import { FileSystem, NodeFileSystem } from "./utils/file-system"
import { Logger, ConsoleLogger } from "./utils/logger"
import { join } from "path"

interface CacheCleanerConfig {
  cacheDir: string
  logger?: Logger
  fileSystem?: FileSystem
}

export class SemanticCacheCleaner {
  private config: CacheCleanerConfig
  private logger: Logger
  private fileSystem: FileSystem

  constructor(config: CacheCleanerConfig) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.fileSystem = config.fileSystem || new NodeFileSystem()
  }

  async clearCache(): Promise<void> {
    try {
      const exists = await this.fileSystem.exists(this.config.cacheDir)

      if (exists) {
        await this.fileSystem.rm(this.config.cacheDir, { recursive: true, force: true })
        this.logger.success("Semantic cache cleared successfully")
      } else {
        this.logger.info("No semantic cache found to clear")
      }
    } catch (error) {
      this.logger.error(`Error clearing semantic cache: ${error}`)
      throw error
    }
  }
}

// CLI entry point
async function main(): Promise<void> {
  const cacheDir = join(process.cwd(), ".quartz-cache", "semantic")
  const cleaner = new SemanticCacheCleaner({ cacheDir })

  await cleaner.clearCache()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Cache clearing failed:", error)
    process.exit(1)
  })
}
```

### Phase 3: Shell Script Migration (Week 3)

#### 3.1 Development Server Migration

```typescript
// scripts/dev-with-drafts.ts
import { execSync } from "child_process"
import { Logger, ConsoleLogger } from "./utils/logger"

interface DevServerConfig {
  logger?: Logger
  includeDrafts?: boolean
}

export class DevServer {
  private config: DevServerConfig
  private logger: Logger

  constructor(config: DevServerConfig = {}) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
  }

  async start(): Promise<void> {
    this.logger.info("🚀 Starting development server with drafts enabled...")
    this.logger.info('📝 All posts marked with "draft: true" will be visible')
    this.logger.info("")

    try {
      // Set environment variable
      if (this.config.includeDrafts !== false) {
        process.env.QUARTZ_INCLUDE_DRAFTS = "true"
      }

      // Run the full development workflow
      await this.runCommand("npm run generate-graph-links")
      await this.runCommand("npm run kill")
      await this.runCommand("npm run build")
      await this.runCommand("npx quartz build --serve")

      this.logger.success("Development server started successfully")
    } catch (error) {
      this.logger.error(`Failed to start development server: ${error}`)
      throw error
    }
  }

  private async runCommand(command: string): Promise<void> {
    this.logger.info(`Running: ${command}`)
    execSync(command, { stdio: "inherit" })
  }
}

// CLI entry point
async function main(): Promise<void> {
  const server = new DevServer({ includeDrafts: true })
  await server.start()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Development server failed:", error)
    process.exit(1)
  })
}
```

#### 3.2 Push with Sanitize Migration

```typescript
// scripts/push-with-sanitize.ts
import { GitOperations, GitOperationsImpl } from "./utils/git"
import { Logger, ConsoleLogger } from "./utils/logger"
import { Sanitizer } from "./sanitize"

interface PushWithSanitizeConfig {
  logger?: Logger
  git?: GitOperations
  sanitizer?: Sanitizer
}

export class PushWithSanitize {
  private config: PushWithSanitizeConfig
  private logger: Logger
  private git: GitOperations
  private sanitizer: Sanitizer

  constructor(config: PushWithSanitizeConfig = {}) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.git = config.git || new GitOperationsImpl()
    this.sanitizer = config.sanitizer || new Sanitizer()
  }

  async execute(): Promise<void> {
    this.logger.info("🚀 Starting push with sanitization process...")

    const currentBranch = this.git.getCurrentBranch()

    if (currentBranch === "main") {
      await this.pushToMain()
    } else {
      await this.pushToOtherBranch()
    }

    this.logger.success("✅ Push process completed successfully!")
  }

  private async pushToMain(): Promise<void> {
    this.logger.info("")
    this.logger.info("📤 Step 1: Pushing to private repository...")

    try {
      this.git.push()
      this.logger.success("Successfully pushed to private repository")

      this.logger.info("")
      this.logger.info("🔄 Step 2: Running sanitization and push to public repository...")
      this.logger.info("")
      this.logger.info("📋 This will:")
      this.logger.info("   ✅ Exclude ALL content (private and public)")
      this.logger.info("   ✅ Exclude ALL build artifacts and cache files")
      this.logger.info("   ✅ Include only source code and configuration")
      this.logger.info("   ✅ Use Git LFS for large files")
      this.logger.info("   ✅ Use optimized git operations")
      this.logger.info("")

      await this.sanitizer.sanitizeAndPush(false, true)

      this.logger.info("")
      this.logger.success("Sanitization and public push completed successfully")
      this.logger.success("🎉 Both private and public repositories are now up to date!")
    } catch (error) {
      this.logger.error(`Sanitization failed: ${error}`)
      this.logger.warning("Private repo was pushed successfully, but public repo was not updated")
      this.logger.info("To retry the public push, run: npm run push-public")
      throw error
    }
  }

  private async pushToOtherBranch(): Promise<void> {
    this.logger.info("ℹ️  Not pushing to main branch, running normal push only...")
    this.git.push()
  }
}

// CLI entry point
async function main(): Promise<void> {
  const pusher = new PushWithSanitize()
  await pusher.execute()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Push with sanitize failed:", error)
    process.exit(1)
  })
}
```

#### 3.3 Launch Agent Setup Migration

```typescript
// scripts/setup-launchagent.ts
import { execSync } from "child_process"
import { copyFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { Logger, ConsoleLogger } from "./utils/logger"

interface LaunchAgentConfig {
  logger?: Logger
  plistSource?: string
  plistDest?: string
}

export class LaunchAgentSetup {
  private config: LaunchAgentConfig
  private logger: Logger

  constructor(config: LaunchAgentConfig = {}) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
  }

  async setup(): Promise<void> {
    const plistSource = this.config.plistSource || join(process.cwd(), "homebrew.mxcl.quartz.plist")
    const plistDest =
      this.config.plistDest ||
      join(process.env.HOME!, "Library/LaunchAgents/homebrew.mxcl.quartz.plist")

    try {
      if (!existsSync(plistSource)) {
        throw new Error(`Plist source file not found: ${plistSource}`)
      }

      // Copy plist file
      copyFileSync(plistSource, plistDest)
      this.logger.info(`Copied plist to ${plistDest}`)

      // Unload existing agent if present
      try {
        execSync(`launchctl unload "${plistDest}"`, { stdio: "pipe" })
        this.logger.info("Unloaded existing launch agent")
      } catch {
        // Ignore error if agent wasn't loaded
      }

      // Load the new agent
      execSync(`launchctl load "${plistDest}"`, { stdio: "inherit" })
      this.logger.success("Quartz dev server will now run at login.")
    } catch (error) {
      this.logger.error(`Failed to setup launch agent: ${error}`)
      throw error
    }
  }
}

// CLI entry point
async function main(): Promise<void> {
  const setup = new LaunchAgentSetup()
  await setup.setup()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Launch agent setup failed:", error)
    process.exit(1)
  })
}
```

### Phase 4: CommonJS Migration (Week 4)

#### 4.1 CSS Testing Framework

```typescript
// scripts/css-testing/index.ts
export * from "./scss-tester"
export * from "./build-tester"
export * from "./transform-tester"
export * from "./debugger"
```

```typescript
// scripts/css-testing/scss-tester.ts
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { Logger, ConsoleLogger } from "../utils/logger"
import * as sass from "sass"

interface SCSSFile {
  path: string
  content: string
  compiled?: string
  errors: string[]
}

interface SCSSTestResult {
  files: SCSSFile[]
  totalFiles: number
  successfulFiles: number
  failedFiles: number
}

export class SCSSFileTester {
  private logger: Logger
  private fileSystem: FileSystem

  constructor(logger?: Logger, fileSystem?: FileSystem) {
    this.logger = logger || new ConsoleLogger()
    this.fileSystem = fileSystem || new NodeFileSystem()
  }

  async testFiles(filesToTest: string[]): Promise<SCSSTestResult> {
    this.logger.info("Testing individual SCSS files for compilation errors...\n")

    const results: SCSSFile[] = []
    let successfulFiles = 0
    let failedFiles = 0

    for (const filePath of filesToTest) {
      const result = await this.testFile(filePath)
      results.push(result)

      if (result.errors.length === 0) {
        successfulFiles++
      } else {
        failedFiles++
      }
    }

    return {
      files: results,
      totalFiles: results.length,
      successfulFiles,
      failedFiles,
    }
  }

  private async testFile(filePath: string): Promise<SCSSFile> {
    const result: SCSSFile = {
      path: filePath,
      content: "",
      errors: [],
    }

    try {
      if (await this.fileSystem.exists(filePath)) {
        this.logger.info(`Testing ${filePath}...`)

        result.content = await this.fileSystem.readFile(filePath)
        result.compiled = sass.compile(filePath).css

        this.logger.success(`${filePath} - OK`)

        // Check for suspicious patterns
        const suspiciousLines = this.findSuspiciousPatterns(result.compiled)
        if (suspiciousLines.length > 0) {
          suspiciousLines.forEach((line) => {
            this.logger.warning(`  ⚠️  Suspicious line ${line.number}: ${line.content.trim()}`)
          })
        } else {
          this.logger.success(`✓ No suspicious $ tokens found in ${filePath}`)
        }
      } else {
        this.logger.error(`${filePath} - File not found`)
        result.errors.push("File not found")
      }
    } catch (error) {
      this.logger.error(`${filePath} - Error: ${error}`)
      result.errors.push(error as string)
    }

    this.logger.info("")
    return result
  }

  private findSuspiciousPatterns(css: string): Array<{ number: number; content: string }> {
    const lines = css.split("\n")
    const suspicious: Array<{ number: number; content: string }> = []

    lines.forEach((line, index) => {
      if (line.includes("$") && !line.match(/\[.*\$.*\]/) && !line.match(/^\s*\/\*/)) {
        suspicious.push({ number: index + 1, content: line })
      }
    })

    return suspicious
  }
}
```

```typescript
// scripts/css-testing/build-tester.ts
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { Logger, ConsoleLogger } from "../utils/logger"
import * as sass from "sass"
import { transform, Features } from "lightningcss"

interface BuildTestResult {
  success: boolean
  errors: string[]
  warnings: string[]
  outputPath?: string
}

export class CSSBuildTester {
  private logger: Logger
  private fileSystem: FileSystem

  constructor(logger?: Logger, fileSystem?: FileSystem) {
    this.logger = logger || new ConsoleLogger()
    this.fileSystem = fileSystem || new NodeFileSystem()
  }

  async testBuildProcess(): Promise<BuildTestResult> {
    const result: BuildTestResult = {
      success: false,
      errors: [],
      warnings: [],
    }

    try {
      this.logger.info("Testing build process CSS generation...\n")

      // Compile main SCSS files
      const customResult = sass.compile("./quartz/styles/custom.scss")
      this.logger.success("✓ Custom CSS compiled successfully")

      const popoverResult = sass.compile("./quartz/components/styles/popover.scss")
      this.logger.success("✓ Popover CSS compiled successfully")

      const semanticResult = sass.compile("./quartz/components/styles/semanticLinks.scss")
      this.logger.success("✓ Semantic links CSS compiled successfully")

      // Join the styles
      const joinedCSS = [customResult.css, popoverResult.css, semanticResult.css].join("\n\n")

      this.logger.success("✓ CSS joined successfully")
      this.logger.info(`CSS length: ${joinedCSS.length}`)

      // Write debug output
      const outputPath = "./debug_joined_css.css"
      await this.fileSystem.writeFile(outputPath, joinedCSS)
      this.logger.success("✓ Joined CSS written to debug_joined_css.css")
      result.outputPath = outputPath

      // Test lightningcss transform
      this.logger.info("\nTesting lightningcss transform...")
      const transformed = transform({
        filename: "test-build.css",
        code: Buffer.from(joinedCSS),
        minify: true,
        targets: {
          safari: (15 << 16) | (6 << 8), // 15.6
          ios_saf: (15 << 16) | (6 << 8), // 15.6
          edge: 115 << 16,
          firefox: 102 << 16,
          chrome: 109 << 16,
        },
        include: Features.MediaQueries,
      })

      this.logger.success("✓ Transform successful")
      this.logger.success("✓ Build process CSS generation completed without errors")
      result.success = true
    } catch (error) {
      result.errors.push(error as string)
      this.logger.error(`✗ Error: ${error}`)

      // Check for problematic characters
      if ((error as string).includes("Unexpected token")) {
        await this.checkForProblematicCharacters(result.outputPath)
      }
    }

    return result
  }

  private async checkForProblematicCharacters(outputPath?: string): Promise<void> {
    this.logger.info("\nChecking for problematic characters in CSS...")

    if (outputPath && (await this.fileSystem.exists(outputPath))) {
      const css = await this.fileSystem.readFile(outputPath)
      const lines = css.split("\n")

      lines.forEach((line, i) => {
        if (line.includes("$") && !line.match(/\/\*/)) {
          this.logger.warning(`Line ${i + 1}: ${line}`)
        }
      })
    }
  }
}
```

```typescript
// scripts/css-testing/transform-tester.ts
import { Logger, ConsoleLogger } from "../utils/logger"
import * as sass from "sass"
import { transform, Features } from "lightningcss"

interface TransformTestResult {
  success: boolean
  errors: string[]
  warnings: string[]
}

export class CSSTransformTester {
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new ConsoleLogger()
  }

  async testTransform(): Promise<TransformTestResult> {
    const result: TransformTestResult = {
      success: false,
      errors: [],
      warnings: [],
    }

    try {
      this.logger.info("Testing lightningcss transform...\n")

      // Compile SCSS
      const sassResult = sass.compile("./quartz/styles/custom.scss")
      this.logger.success("✓ SCSS compilation successful")

      // Test lightningcss transform
      this.logger.info("Testing lightningcss transform...")
      const transformed = transform({
        filename: "test.css",
        code: Buffer.from(sassResult.css),
        minify: true,
        targets: {
          safari: (15 << 16) | (6 << 8), // 15.6
          ios_saf: (15 << 16) | (6 << 8), // 15.6
          edge: 115 << 16,
          firefox: 102 << 16,
          chrome: 109 << 16,
        },
        include: Features.MediaQueries,
      })

      this.logger.success("✓ lightningcss transform successful")
      this.logger.success("✓ CSS minification completed without errors")
      result.success = true
    } catch (error) {
      result.errors.push(error as string)
      this.logger.error(`✗ Transform failed: ${error}`)
    }

    return result
  }
}
```

```typescript
// scripts/css-testing/debugger.ts
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { Logger, ConsoleLogger } from "../utils/logger"
import * as sass from "sass"

interface CSSDebugResult {
  success: boolean
  outputPath?: string
  suspiciousLines: Array<{ number: number; content: string }>
  errors: string[]
}

export class CSSDebugger {
  private logger: Logger
  private fileSystem: FileSystem

  constructor(logger?: Logger, fileSystem?: FileSystem) {
    this.logger = logger || new ConsoleLogger()
    this.fileSystem = fileSystem || new NodeFileSystem()
  }

  async debugCSS(): Promise<CSSDebugResult> {
    const result: CSSDebugResult = {
      success: false,
      suspiciousLines: [],
      errors: [],
    }

    try {
      // Compile the main SCSS file
      const sassResult = sass.compile("./quartz/styles/custom.scss")

      // Write debug output
      const outputPath = "./debug_output.css"
      await this.fileSystem.writeFile(outputPath, sassResult.css)
      this.logger.info("CSS written to debug_output.css")
      result.outputPath = outputPath

      // Check for suspicious patterns
      result.suspiciousLines = this.findSuspiciousPatterns(sassResult.css)

      result.suspiciousLines.forEach((line) => {
        this.logger.warning(`Suspicious line ${line.number}: ${line.content}`)
      })

      result.success = true
    } catch (error) {
      result.errors.push(error as string)
      this.logger.error(`SCSS compilation failed: ${error}`)
    }

    return result
  }

  private findSuspiciousPatterns(css: string): Array<{ number: number; content: string }> {
    const lines = css.split("\n")
    const suspicious: Array<{ number: number; content: string }> = []

    lines.forEach((line, i) => {
      if (line.includes("$") && !line.match(/\[.*\$.*\]/)) {
        suspicious.push({ number: i + 1, content: line })
      }
    })

    return suspicious
  }
}
```

### Phase 5: Integration and Testing (Week 5)

#### 5.1 CLI Interface

```typescript
// scripts/cli.ts
#!/usr/bin/env npx tsx

import { Command } from 'commander'
import { GraphLinkGenerator } from './generate-graph-links'
import { SemanticCacheCleaner } from './clear-semantic-cache'
import { DevServer } from './dev-with-drafts'
import { PushWithSanitize } from './push-with-sanitize'
import { LaunchAgentSetup } from './setup-launchagent'
import { SCSSFileTester, CSSBuildTester, CSSTransformTester, CSSDebugger } from './css-testing'

const program = new Command()

program
  .name('ratgarden-scripts')
  .description('RatGarden development and maintenance scripts')
  .version('1.0.0')

// Development commands
program
  .command('dev-with-drafts')
  .description('Start development server with drafts enabled')
  .action(async () => {
    const server = new DevServer({ includeDrafts: true })
    await server.start()
  })

program
  .command('generate-graph-links')
  .description('Generate graph links for Quartz')
  .action(async () => {
    const generator = new GraphLinkGenerator({
      contentDir: './content'
    })
    await generator.generateGraphLinks()
  })

program
  .command('clear-semantic-cache')
  .description('Clear semantic analysis cache')
  .action(async () => {
    const cleaner = new SemanticCacheCleaner({
      cacheDir: './.quartz-cache/semantic'
    })
    await cleaner.clearCache()
  })

// Deployment commands
program
  .command('push-with-sanitize')
  .description('Push to private repo and sanitize for public repo')
  .action(async () => {
    const pusher = new PushWithSanitize()
    await pusher.execute()
  })

// Setup commands
program
  .command('setup-launchagent')
  .description('Setup Quartz as macOS launch agent')
  .action(async () => {
    const setup = new LaunchAgentSetup()
    await setup.setup()
  })

// Testing commands
program
  .command('test-scss')
  .description('Test individual SCSS files')
  .action(async () => {
    const tester = new SCSSFileTester()
    const filesToTest = [
      './quartz/styles/custom.scss',
      './quartz/components/styles/semanticLinks.scss',
      './quartz/styles/base.scss',
      './quartz/styles/variables.scss',
      './quartz/styles/themes/_index.scss'
    ]
    await tester.testFiles(filesToTest)
  })

program
  .command('test-build-css')
  .description('Test complete CSS build process')
  .action(async () => {
    const tester = new CSSBuildTester()
    await tester.testBuildProcess()
  })

program
  .command('test-transform')
  .description('Test lightningcss transformation')
  .action(async () => {
    const tester = new CSSTransformTester()
    await tester.testTransform()
  })

program
  .command('debug-css')
  .description('Debug CSS compilation output')
  .action(async () => {
    const debugger = new CSSDebugger()
    await debugger.debugCSS()
  })

program.parse()
```

#### 5.2 Package.json Updates

```json
{
  "scripts": {
    "scripts:build": "tsc -p scripts/tsconfig.json",
    "scripts:dev": "tsc -p scripts/tsconfig.json --watch",
    "scripts:test": "jest scripts/__tests__",
    "scripts:lint": "eslint scripts/**/*.ts",
    "scripts:format": "prettier --write scripts/**/*.ts",
    "scripts:clean": "rm -rf scripts/dist",
    "scripts:start": "node scripts/dist/cli.js",
    "dev-with-drafts": "npx tsx scripts/dev-with-drafts.ts",
    "generate-graph-links": "npx tsx scripts/generate-graph-links.ts",
    "clear-semantic-cache": "npx tsx scripts/clear-semantic-cache.ts",
    "push-with-sanitize": "npx tsx scripts/push-with-sanitize.ts",
    "setup-launchagent": "npx tsx scripts/setup-launchagent.ts",
    "test-scss": "npx tsx scripts/css-testing/scss-tester.ts",
    "test-build-css": "npx tsx scripts/css-testing/build-tester.ts",
    "test-transform": "npx tsx scripts/css-testing/transform-tester.ts",
    "debug-css": "npx tsx scripts/css-testing/debugger.ts"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/sass": "^1.45.0",
    "commander": "^11.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Migration Benefits

### Type Safety

- **Compile-time Error Detection**: Catch errors before runtime
- **IntelliSense Support**: Better IDE integration and autocomplete
- **Refactoring Safety**: Confident code changes with type checking
- **Interface Contracts**: Clear contracts between components

### Maintainability

- **Consistent Code Style**: Unified TypeScript patterns
- **Better Documentation**: Types serve as living documentation
- **Easier Testing**: Type-safe mocking and testing
- **Reduced Bugs**: Type system prevents common errors

### Developer Experience

- **Modern Tooling**: Latest TypeScript features and tooling
- **Better Debugging**: Type information in debuggers
- **Code Navigation**: Improved IDE navigation and search
- **Refactoring Tools**: Advanced refactoring capabilities

### Performance

- **Optimized Builds**: TypeScript compiler optimizations
- **Tree Shaking**: Better dead code elimination
- **Bundle Size**: Potential for smaller bundles with proper configuration
- **Runtime Performance**: No runtime overhead from types

## Migration Risks and Mitigation

### Risks

1. **Breaking Changes**: TypeScript strict mode may reveal existing issues
2. **Learning Curve**: Team needs to understand TypeScript
3. **Build Complexity**: Additional build step required
4. **Dependency Management**: Need to manage TypeScript dependencies

### Mitigation Strategies

1. **Gradual Migration**: Migrate files one at a time
2. **Strict Mode Gradual**: Start with loose TypeScript config
3. **Comprehensive Testing**: Test each migrated component
4. **Documentation**: Provide clear migration guides
5. **Team Training**: Invest in TypeScript training

## Post-Migration Tasks

### Code Quality

- [ ] Enable strict TypeScript mode
- [ ] Add comprehensive unit tests
- [ ] Implement error boundaries
- [ ] Add performance monitoring
- [ ] Create code documentation

### Tooling

- [ ] Set up CI/CD for TypeScript builds
- [ ] Configure linting and formatting
- [ ] Add pre-commit hooks
- [ ] Set up automated testing
- [ ] Configure IDE settings

### Documentation

- [ ] Update README files
- [ ] Create API documentation
- [ ] Write migration guides
- [ ] Document best practices
- [ ] Create troubleshooting guides

## Conclusion

This migration plan provides a comprehensive approach to transitioning all scripts to TypeScript while maintaining functionality and improving code quality. The phased approach minimizes risk and allows for thorough testing at each stage.

The benefits of TypeScript include improved type safety, better maintainability, enhanced developer experience, and potential performance improvements. The migration will result in a more robust and maintainable codebase that's easier to extend and debug.

By following this plan, the RatGarden project will have a modern, type-safe scripting infrastructure that supports future development and maintenance needs.
