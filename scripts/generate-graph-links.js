#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to content directory
const contentDir = path.join(__dirname, "..", "content")

// Function to get all markdown files recursively
function getMarkdownFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip .obsidian directory
      if (item !== ".obsidian") {
        files.push(...getMarkdownFiles(fullPath))
      }
    } else if (item.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

// Function to add graph links to index file
function addGraphLinksToIndex(filePath) {
  // Ensure we only process index.md
  if (path.basename(filePath) !== "index.md") {
    console.log(`⚠ Skipping ${path.relative(contentDir, filePath)} - Only index.md is processed`)
    return
  }

  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Find the end of frontmatter
    const frontmatterEnd = content.indexOf("---", 3)
    if (frontmatterEnd === -1) {
      console.log(`⚠ ${path.relative(contentDir, filePath)} - No frontmatter found, skipping`)
      return
    }

    // Generate graph links section
    const markdownFiles = getMarkdownFiles(contentDir)
    const graphLinksSection = `<!-- Graph links - invisible but parsed by Quartz -->
<div style="font-size: 0px; color: transparent; height: 0; overflow: hidden;">

${markdownFiles
  .map((filePath) => {
    const fileName = path.basename(filePath, ".md")
    return `[[${fileName}]]`
  })
  .join("\n")}

</div>`

    let newContent
    let action

    // Check if graph links section already exists
    if (content.includes("<!-- Graph links - invisible but parsed by Quartz -->")) {
      // Remove existing graph links section
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

      // Find the end of frontmatter in the remaining content
      const remainingFrontmatterEnd = beforeGraphLinks.indexOf("---", 3)
      if (remainingFrontmatterEnd !== -1) {
        const beforeFrontmatter = beforeGraphLinks.substring(0, remainingFrontmatterEnd + 3)
        const afterFrontmatter = beforeFrontmatter + "\n\n" + graphLinksSection + afterGraphLinks
        newContent = afterFrontmatter
      } else {
        // If no frontmatter found, just replace the entire graph links section
        newContent = beforeGraphLinks + "\n\n" + graphLinksSection + afterGraphLinks
      }
      action = "Updated"
    } else {
      // Insert graph links after frontmatter
      const beforeFrontmatter = content.substring(0, frontmatterEnd + 3)
      const afterFrontmatter = content.substring(frontmatterEnd + 3)

      newContent = beforeFrontmatter + "\n\n" + graphLinksSection + afterFrontmatter
      action = "Added"
    }

    fs.writeFileSync(filePath, newContent)
    console.log(`✓ ${path.relative(contentDir, filePath)} - ${action} graph links`)
  } catch (error) {
    console.error(`✗ ${path.relative(contentDir, filePath)} - Error: ${error.message}`)
  }
}

// Main execution - ONLY processes index.md
function main() {
  console.log("Updating graph links in index.md (only)...\n")

  try {
    const indexPath = path.join(contentDir, "index.md")

    if (!fs.existsSync(indexPath)) {
      console.log("index.md not found in content directory")
      return
    }

    addGraphLinksToIndex(indexPath)

    console.log("\n✅ Processing complete!")
    console.log("- Graph links updated in index.md only")
    console.log("- No other files were modified")
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

main()
