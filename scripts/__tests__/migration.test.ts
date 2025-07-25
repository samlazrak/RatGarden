import { describe, expect, it } from "@jest/globals"
import { NodeFileSystem } from "../utils/file-system"
import { GitOperationsImpl } from "../utils/git"
import { ConsoleLogger } from "../utils/logger"

describe("TypeScript Migration Tests", () => {
  it("should create logger instance", () => {
    const logger = new ConsoleLogger()
    expect(logger).toBeInstanceOf(ConsoleLogger)
    expect(typeof logger.info).toBe("function")
    expect(typeof logger.success).toBe("function")
    expect(typeof logger.warning).toBe("function")
    expect(typeof logger.error).toBe("function")
    expect(typeof logger.debug).toBe("function")
  })

  it("should create file system instance", () => {
    const fileSystem = new NodeFileSystem()
    expect(fileSystem).toBeInstanceOf(NodeFileSystem)
    expect(typeof fileSystem.readFile).toBe("function")
    expect(typeof fileSystem.writeFile).toBe("function")
    expect(typeof fileSystem.exists).toBe("function")
  })

  it("should create git operations instance", () => {
    const git = new GitOperationsImpl()
    expect(git).toBeInstanceOf(GitOperationsImpl)
    expect(typeof git.getCurrentBranch).toBe("function")
    expect(typeof git.push).toBe("function")
    expect(typeof git.add).toBe("function")
    expect(typeof git.commit).toBe("function")
  })

  it("should handle logger interface correctly", () => {
    const logger: ConsoleLogger = new ConsoleLogger()

    // Test that all required methods exist
    expect(logger.info).toBeDefined()
    expect(logger.success).toBeDefined()
    expect(logger.warning).toBeDefined()
    expect(logger.error).toBeDefined()
    expect(logger.debug).toBeDefined()
  })

  it("should handle file system interface correctly", () => {
    const fileSystem: NodeFileSystem = new NodeFileSystem()

    // Test that all required methods exist
    expect(fileSystem.readFile).toBeDefined()
    expect(fileSystem.writeFile).toBeDefined()
    expect(fileSystem.exists).toBeDefined()
    expect(fileSystem.mkdir).toBeDefined()
    expect(fileSystem.rm).toBeDefined()
    expect(fileSystem.glob).toBeDefined()
  })

  it("should handle git operations interface correctly", () => {
    const git: GitOperationsImpl = new GitOperationsImpl()

    // Test that all required methods exist
    expect(git.getCurrentBranch).toBeDefined()
    expect(git.push).toBeDefined()
    expect(git.add).toBeDefined()
    expect(git.commit).toBeDefined()
    expect(git.clone).toBeDefined()
    expect(git.init).toBeDefined()
    expect(git.remoteAdd).toBeDefined()
  })
})
