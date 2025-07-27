import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RemoveDrafts } from '../../../quartz/plugins/filters/draft'

describe('RemoveDrafts Filter', () => {
  const originalEnv = process.env.QUARTZ_INCLUDE_PRIVATE

  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.QUARTZ_INCLUDE_PRIVATE
  })

  afterEach(() => {
    // Restore original environment variable after each test
    if (originalEnv !== undefined) {
      process.env.QUARTZ_INCLUDE_PRIVATE = originalEnv
    } else {
      delete process.env.QUARTZ_INCLUDE_PRIVATE
    }
  })

  const createMockVFile = (frontmatter: any) => ({
    data: {
      frontmatter
    }
  })

  const mockCtx = {}
  const mockTree = {}

  describe('Draft Content Filtering', () => {
    it('should filter out content with draft: true', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: true })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should filter out content with draft: "true"', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: "true" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should publish content with draft: false', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: false })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should publish content with draft: "false"', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: "false" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should publish content without draft frontmatter', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ title: "Regular Post" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })
  })

  describe('Private Content Filtering', () => {
    it('should filter out content with private: true', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ private: true })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should filter out content with private: "true"', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ private: "true" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should publish content with private: false', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ private: false })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should publish content without private frontmatter', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ title: "Regular Post" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })
  })

  describe('Combined Draft and Private Filtering', () => {
    it('should filter out content with both draft: true and private: true', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: true, private: true })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should filter out content with draft: true and private: false', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: true, private: false })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should filter out content with draft: false and private: true', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: false, private: true })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should publish content with both draft: false and private: false', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({ draft: false, private: false })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })
  })

  describe('QUARTZ_INCLUDE_PRIVATE Environment Variable', () => {
    it('should include all content when QUARTZ_INCLUDE_PRIVATE is true', () => {
      process.env.QUARTZ_INCLUDE_PRIVATE = 'true'
      
      const plugin = RemoveDrafts()
      
      // Test draft content
      const draftVFile = createMockVFile({ draft: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, draftVFile])).toBe(true)
      
      // Test private content  
      const privateVFile = createMockVFile({ private: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, privateVFile])).toBe(true)
      
      // Test both draft and private
      const bothVFile = createMockVFile({ draft: true, private: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, bothVFile])).toBe(true)
      
      // Test regular content
      const regularVFile = createMockVFile({ title: "Regular Post" })
      expect(plugin.shouldPublish(mockCtx, [mockTree, regularVFile])).toBe(true)
    })

    it('should filter normally when QUARTZ_INCLUDE_PRIVATE is false', () => {
      process.env.QUARTZ_INCLUDE_PRIVATE = 'false'
      
      const plugin = RemoveDrafts()
      
      // Test draft content should be filtered
      const draftVFile = createMockVFile({ draft: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, draftVFile])).toBe(false)
      
      // Test private content should be filtered
      const privateVFile = createMockVFile({ private: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, privateVFile])).toBe(false)
      
      // Test regular content should be published
      const regularVFile = createMockVFile({ title: "Regular Post" })
      expect(plugin.shouldPublish(mockCtx, [mockTree, regularVFile])).toBe(true)
    })

    it('should filter normally when QUARTZ_INCLUDE_PRIVATE is not set', () => {
      // Environment variable is already unset in beforeEach
      
      const plugin = RemoveDrafts()
      
      // Test draft content should be filtered
      const draftVFile = createMockVFile({ draft: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, draftVFile])).toBe(false)
      
      // Test private content should be filtered
      const privateVFile = createMockVFile({ private: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, privateVFile])).toBe(false)
      
      // Test regular content should be published
      const regularVFile = createMockVFile({ title: "Regular Post" })
      expect(plugin.shouldPublish(mockCtx, [mockTree, regularVFile])).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined frontmatter', () => {
      const plugin = RemoveDrafts()
      const vfile = { data: { frontmatter: undefined } }
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should handle null frontmatter', () => {
      const plugin = RemoveDrafts()
      const vfile = { data: { frontmatter: null } }
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should handle empty frontmatter object', () => {
      const plugin = RemoveDrafts()
      const vfile = createMockVFile({})
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should handle vfile without data property', () => {
      const plugin = RemoveDrafts()
      const vfile = {}
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should handle non-boolean draft values', () => {
      const plugin = RemoveDrafts()
      
      // Test with number
      const numberVFile = createMockVFile({ draft: 0 })
      expect(plugin.shouldPublish(mockCtx, [mockTree, numberVFile])).toBe(true)
      
      // Test with string (not "true")
      const stringVFile = createMockVFile({ draft: "draft" })
      expect(plugin.shouldPublish(mockCtx, [mockTree, stringVFile])).toBe(true)
      
      // Test with array
      const arrayVFile = createMockVFile({ draft: [] })
      expect(plugin.shouldPublish(mockCtx, [mockTree, arrayVFile])).toBe(true)
    })
  })

  describe('Plugin Configuration', () => {
    it('should have correct plugin name', () => {
      const plugin = RemoveDrafts()
      
      expect(plugin.name).toBe('RemoveDrafts')
    })

    it('should be a function that returns a plugin object', () => {
      expect(typeof RemoveDrafts).toBe('function')
      
      const plugin = RemoveDrafts()
      
      expect(typeof plugin).toBe('object')
      expect(typeof plugin.shouldPublish).toBe('function')
      expect(typeof plugin.name).toBe('string')
    })
  })
})