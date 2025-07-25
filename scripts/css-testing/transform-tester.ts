import { Features, transform } from "lightningcss"
import * as sass from "sass"
import { ConsoleLogger, Logger } from "../utils/logger"

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
