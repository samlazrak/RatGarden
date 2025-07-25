import { Features, transform } from "lightningcss"
import * as sass from "sass"
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { ConsoleLogger, Logger } from "../utils/logger"

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
