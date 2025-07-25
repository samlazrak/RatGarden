import * as sass from "sass"
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { ConsoleLogger, Logger } from "../utils/logger"

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
