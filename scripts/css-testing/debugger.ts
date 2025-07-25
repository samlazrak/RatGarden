import * as sass from "sass"
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { ConsoleLogger, Logger } from "../utils/logger"

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
