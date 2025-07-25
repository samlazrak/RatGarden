#!/usr/bin/env npx tsx

import { execSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"

interface TestResult {
  name: string
  passed: boolean
  message: string
}

class SanitizationTester {
  private results: TestResult[] = []

  private log(message: string, type: "info" | "success" | "warning" | "error" = "info"): void {
    const colors = {
      info: "\x1b[34m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
      reset: "\x1b[0m",
    }

    const prefix = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    }

    console.log(`${colors[type]}${prefix[type]}${colors.reset} ${message}`)
  }

  private addResult(name: string, passed: boolean, message: string): void {
    this.results.push({ name, passed, message })
  }

  async runTests(): Promise<void> {
    console.log("🧪 Testing sanitization system...\n")

    // Test 1: Check if main script exists
    this.testScriptExists()

    // Test 2: Check if git hook exists
    this.testGitHookExists()

    // Test 3: Check if configuration file exists
    this.testConfigExists()

    // Test 4: Test dry run
    await this.testDryRun()

    // Test 5: Check for required tools
    this.testRequiredTools()

    // Test 6: Check for sensitive files
    this.testSensitiveFiles()

    // Test 7: Check for draft posts
    this.testDraftPosts()

    this.printResults()
  }

  private testScriptExists(): void {
    const scriptPath = join(process.cwd(), "scripts", "sanitize.ts")
    const exists = existsSync(scriptPath)

    if (exists) {
      this.log("Main script exists: scripts/sanitize.ts", "success")
      this.addResult("Script Exists", true, "TypeScript sanitization script found")
    } else {
      this.log("Main script not found: scripts/sanitize.ts", "error")
      this.addResult("Script Exists", false, "TypeScript sanitization script not found")
    }
  }

  private testGitHookExists(): void {
    const hookPath = join(process.cwd(), ".git", "hooks", "pre-push")
    const exists = existsSync(hookPath)

    if (exists) {
      this.log("Git hook exists: .git/hooks/pre-push", "success")
      this.addResult("Git Hook Exists", true, "Pre-push hook found")
    } else {
      this.log("Git hook not found: .git/hooks/pre-push", "error")
      this.addResult("Git Hook Exists", false, "Pre-push hook not found")
    }
  }

  private testConfigExists(): void {
    const configPath = join(process.cwd(), "scripts", "sanitize-config.json")
    const exists = existsSync(configPath)

    if (exists) {
      this.log("Configuration file exists: scripts/sanitize-config.json", "success")
      this.addResult("Config Exists", true, "Configuration file found")
    } else {
      this.log("Configuration file not found: scripts/sanitize-config.json", "error")
      this.addResult("Config Exists", false, "Configuration file not found")
    }
  }

  private async testDryRun(): Promise<void> {
    try {
      this.log("Running dry run test...")
      execSync("npx tsx scripts/sanitize.ts --dry-run", {
        stdio: "pipe",
        timeout: 30000,
      })
      this.log("Dry run test passed", "success")
      this.addResult("Dry Run", true, "Dry run completed successfully")
    } catch (error) {
      this.log("Dry run test failed", "error")
      this.addResult("Dry Run", false, `Dry run failed: ${error}`)
    }
  }

  private testRequiredTools(): void {
    console.log("\n🔧 Checking required tools...")

    // Check for Node.js
    try {
      const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim()
      this.log(`Node.js found: ${nodeVersion}`, "success")
      this.addResult("Node.js", true, `Node.js ${nodeVersion} available`)
    } catch {
      this.log("Node.js not found", "error")
      this.addResult("Node.js", false, "Node.js not available")
    }

    // Check for git
    try {
      const gitVersion = execSync("git --version", { encoding: "utf8" }).trim()
      this.log(`Git found: ${gitVersion}`, "success")
      this.addResult("Git", true, `Git ${gitVersion} available`)
    } catch {
      this.log("Git not found", "error")
      this.addResult("Git", false, "Git not available")
    }

    // Check for tsx
    try {
      execSync("npx tsx --version", { stdio: "pipe" })
      this.log("tsx found", "success")
      this.addResult("tsx", true, "tsx available for TypeScript execution")
    } catch {
      this.log("tsx not found - install with: npm install -g tsx", "warning")
      this.addResult("tsx", false, "tsx not available")
    }
  }

  private testSensitiveFiles(): void {
    console.log("\n🔍 Checking for sensitive files...")

    const sensitiveFiles = [
      "api/ai-assistant.js",
      ".env",
      ".env.local",
      ".env.example",
      "private/",
      "node_modules/",
      "public/",
      ".quartz-cache/",
      ".vscode/",
      ".claude/",
      ".idea/",
    ]

    for (const file of sensitiveFiles) {
      const filePath = join(process.cwd(), file)
      if (existsSync(filePath)) {
        this.log(`Found sensitive file: ${file} (will be excluded)`, "success")
      } else {
        this.log(`Sensitive file not found: ${file}`, "info")
      }
    }

    this.addResult("Sensitive Files", true, "Sensitive files check completed")
  }

  private testDraftPosts(): void {
    console.log("\n📝 Checking for draft posts...")

    try {
      const findResult = execSync(
        'find content/ docs/ -name "*.md" -type f -exec grep -l "^draft: true" {} \; 2>/dev/null | wc -l',
        {
          encoding: "utf8",
        },
      ).trim()

      const draftCount = parseInt(findResult) || 0
      this.log(`Found ${draftCount} draft posts (will be excluded)`, "success")
      this.addResult("Draft Posts", true, `${draftCount} draft posts found`)
    } catch {
      this.log("Could not check for draft posts", "warning")
      this.addResult("Draft Posts", false, "Could not check for draft posts")
    }
  }

  private printResults(): void {
    console.log("\n📊 Test Results:")
    console.log("================")

    let passedCount = 0
    let totalCount = this.results.length

    for (const result of this.results) {
      const status = result.passed ? "✅ PASS" : "❌ FAIL"
      console.log(`${status} ${result.name}: ${result.message}`)
      if (result.passed) passedCount++
    }

    console.log(`\n🎯 Summary: ${passedCount}/${totalCount} tests passed`)

    if (passedCount === totalCount) {
      console.log("\n🎉 All tests passed! The sanitization system is ready to use.")
      console.log("\nNext steps:")
      console.log("1. Create the public repository: git@github.com:samlazrak/Digital-Garden.git")
      console.log("2. Ensure your SSH key is set up for both repositories")
      console.log("3. Push to main branch to trigger automatic sanitization")
      console.log("\nTo test manually:")
      console.log("  npx tsx scripts/sanitize.ts --dry-run")
    } else {
      console.log(
        "\n⚠️  Some tests failed. Please fix the issues before using the sanitization system.",
      )
    }
  }
}

// Run the tests
async function main(): Promise<void> {
  const tester = new SanitizationTester()
  await tester.runTests()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Test failed:", error)
    process.exit(1)
  })
}

export { SanitizationTester }
