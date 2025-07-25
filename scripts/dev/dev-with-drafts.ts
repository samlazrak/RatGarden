import { execSync } from "child_process"
import { ConsoleLogger, Logger } from "./utils/logger"

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
