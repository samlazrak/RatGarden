import { describe, it, expect, beforeEach, afterEach } from "node:test"
import { RemoveDrafts } from "../quartz/plugins/filters/draft"

describe("RemoveDrafts Plugin", () => {
  const originalEnv = process.env.QUARTZ_INCLUDE_DRAFTS

  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.QUARTZ_INCLUDE_DRAFTS
  })

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv) {
      process.env.QUARTZ_INCLUDE_DRAFTS = originalEnv
    } else {
      delete process.env.QUARTZ_INCLUDE_DRAFTS
    }
  })

  it("should filter out draft posts by default", () => {
    const plugin = RemoveDrafts()
    
    // Mock content with draft: true
    const draftContent = [
      null,
      {
        data: {
          frontmatter: { draft: true }
        }
      }
    ] as any

    // Mock content without draft flag
    const publishedContent = [
      null,
      {
        data: {
          frontmatter: {}
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, draftContent)).toBe(false)
    expect(plugin.shouldPublish({} as any, publishedContent)).toBe(true)
  })

  it("should include all posts when QUARTZ_INCLUDE_DRAFTS is true", () => {
    process.env.QUARTZ_INCLUDE_DRAFTS = "true"
    const plugin = RemoveDrafts()
    
    // Mock content with draft: true
    const draftContent = [
      null,
      {
        data: {
          frontmatter: { draft: true }
        }
      }
    ] as any

    // Mock content without draft flag
    const publishedContent = [
      null,
      {
        data: {
          frontmatter: {}
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, draftContent)).toBe(true)
    expect(plugin.shouldPublish({} as any, publishedContent)).toBe(true)
  })

  it("should handle string 'true' draft values", () => {
    const plugin = RemoveDrafts()
    
    const stringDraftContent = [
      null,
      {
        data: {
          frontmatter: { draft: "true" }
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, stringDraftContent)).toBe(false)
  })

  it("should handle string 'true' draft values when drafts are included", () => {
    process.env.QUARTZ_INCLUDE_DRAFTS = "true"
    const plugin = RemoveDrafts()
    
    const stringDraftContent = [
      null,
      {
        data: {
          frontmatter: { draft: "true" }
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, stringDraftContent)).toBe(true)
  })
}) 