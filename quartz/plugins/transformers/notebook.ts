import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"
import fs from "fs"
import path from "path"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"

export interface Options {
  cacheDir?: string
  downloadFromGitHub?: boolean
  downloadTimeout?: number
}

interface NotebookCell {
  cell_type: string
  source: string | string[]
  outputs?: any[]
  metadata?: any
}

interface NotebookData {
  cells: NotebookCell[]
  metadata?: any
}

const defaultOptions: Options = {
  cacheDir: "quartz/.quartz-cache/notebooks",
  downloadFromGitHub: true,
  downloadTimeout: 15000,
}

export const NotebookEmbedding: QuartzTransformerPlugin<Options | undefined> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "NotebookEmbedding",
    textTransform(_ctx, src) {
      return src
    },
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, _file) => {
            visit(tree, "link", (node, index, parent) => {
              if (
                node.url &&
                node.url.endsWith(".ipynb") &&
                parent &&
                index !== undefined
              ) {
                const notebookPath = node.url
                const notebookTitle = toString(node) || "Jupyter Notebook"

                try {
                  const notebookContent = loadNotebook(notebookPath, opts)
                  if (notebookContent) {
                    const htmlContent = renderNotebook(notebookContent, notebookTitle, notebookPath)
                    
                    // Replace the link with HTML content
                    parent.children[index] = {
                      type: "html",
                      value: htmlContent,
                    } as any
                  }
                } catch (error) {
                  console.error(`Failed to load notebook ${notebookPath}:`, error)
                  // Keep the original link if loading fails
                }
              }
            })
          }
        },
      ]
    },
    htmlPlugins() {
      return []
    },
  }
}

function loadNotebook(notebookPath: string, opts: Options): NotebookData | null {
  try {
    // Handle GitHub URLs
    if (opts.downloadFromGitHub && (notebookPath.startsWith("http://") || notebookPath.startsWith("https://"))) {
      return downloadAndCacheNotebook(notebookPath, opts)
    }

    // Handle local files
    if (fs.existsSync(notebookPath)) {
      const content = fs.readFileSync(notebookPath, "utf-8")
      return JSON.parse(content)
    }

    return null
  } catch (error) {
    console.error(`Error loading notebook: ${error}`)
    return null
  }
}

function downloadAndCacheNotebook(url: string, opts: Options): NotebookData | null {
  try {
    // Ensure cache directory exists
    if (opts.cacheDir && !fs.existsSync(opts.cacheDir)) {
      fs.mkdirSync(opts.cacheDir, { recursive: true })
    }

    // Create cache filename from URL
    const urlHash = Buffer.from(url).toString("base64").replace(/[/+=]/g, "_")
    const cacheFile = path.join(opts.cacheDir || "cache", `${urlHash}.json`)

    // Check if cached version exists and is recent (24 hours)
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile)
      const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60)
      if (ageHours < 24) {
        const content = fs.readFileSync(cacheFile, "utf-8")
        return JSON.parse(content)
      }
    }

    // Convert GitHub URLs to raw URLs
    let rawUrl = url
    if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
      rawUrl = url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/")
    }

    // Download notebook (this would need to be implemented with actual HTTP client)
    console.log(`Would download notebook from: ${rawUrl}`)
    
    // For now, return null since we can't actually download without HTTP client
    // In a real implementation, you'd use fetch or axios here
    return null

  } catch (error) {
    console.error(`Error downloading notebook: ${error}`)
    return null
  }
}

function renderNotebook(notebook: NotebookData, title: string, source: string): string {
  const cells = notebook.cells || []
  const favicon = getFavicon(source)
  
  let html = `
    <div class="notebook-container">
      <div class="notebook-header">
        <div class="notebook-title">
          ${favicon ? `<img src="${favicon}" alt="Source" class="notebook-favicon">` : ""}
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="notebook-source">
          <a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </div>
      </div>
      <div class="notebook-content">
  `

  cells.forEach((cell, index) => {
    html += renderCell(cell, index)
  })

  html += `
      </div>
    </div>
  `

  return html
}

function renderCell(cell: NotebookCell, index: number): string {
  const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source

  switch (cell.cell_type) {
    case "markdown":
      return `
        <div class="notebook-cell notebook-markdown-cell">
          <div class="cell-content">
            ${renderMarkdown(source)}
          </div>
        </div>
      `

    case "code":
      let html = `
        <div class="notebook-cell notebook-code-cell">
          <div class="cell-input">
            <div class="cell-prompt">In [${index + 1}]:</div>
            <div class="cell-code">
              <pre><code class="language-python">${escapeHtml(source)}</code></pre>
            </div>
          </div>
      `

      // Render outputs if they exist
      if (cell.outputs && cell.outputs.length > 0) {
        html += `<div class="cell-outputs">`
        cell.outputs.forEach((output, outputIndex) => {
          html += renderCellOutput(output, outputIndex)
        })
        html += `</div>`
      }

      html += `</div>`
      return html

    default:
      return `
        <div class="notebook-cell notebook-unknown-cell">
          <div class="cell-content">
            <pre>${escapeHtml(source)}</pre>
          </div>
        </div>
      `
  }
}

function renderCellOutput(output: any, index: number): string {
  if (!output) return ""

  switch (output.output_type) {
    case "stream":
      return `
        <div class="cell-output cell-output-stream">
          <pre>${escapeHtml(output.text ? (Array.isArray(output.text) ? output.text.join("") : output.text) : "")}</pre>
        </div>
      `

    case "execute_result":
    case "display_data":
      let html = ""
      if (output.data) {
        if (output.data["text/html"]) {
          const htmlContent = Array.isArray(output.data["text/html"]) 
            ? output.data["text/html"].join("") 
            : output.data["text/html"]
          html += `<div class="cell-output cell-output-html">${htmlContent}</div>`
        } else if (output.data["text/plain"]) {
          const textContent = Array.isArray(output.data["text/plain"]) 
            ? output.data["text/plain"].join("") 
            : output.data["text/plain"]
          html += `<div class="cell-output cell-output-text"><pre>${escapeHtml(textContent)}</pre></div>`
        }

        if (output.data["image/png"]) {
          html += `<div class="cell-output cell-output-image"><img src="data:image/png;base64,${output.data["image/png"]}" alt="Output image"></div>`
        }
      }
      return html

    case "error":
      const traceback = output.traceback ? output.traceback.join("\n") : ""
      return `
        <div class="cell-output cell-output-error">
          <pre>${escapeHtml(traceback)}</pre>
        </div>
      `

    default:
      return `<div class="cell-output cell-output-unknown"><pre>${escapeHtml(JSON.stringify(output, null, 2))}</pre></div>`
  }
}

function renderMarkdown(source: string): string {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })

    const result = processor.processSync(source)
    return String(result)
  } catch (error) {
    console.error("Error rendering markdown:", error)
    return `<p>${escapeHtml(source)}</p>`
  }
}

function getFavicon(source: string): string | null {
  try {
    if (source.includes("github.com")) {
      return "https://github.com/favicon.ico"
    }
    if (source.includes("gitlab.com")) {
      return "https://about.gitlab.com/ico/favicon-32x32.png"
    }
    // Add more favicon mappings as needed
    return null
  } catch {
    return null
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}