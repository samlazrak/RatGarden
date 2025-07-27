import { describe, it, expect } from 'vitest'
import { ExplicitPublish } from '../../../quartz/plugins/filters/explicit'

describe('ExplicitPublish Filter', () => {
  const createMockVFile = (frontmatter: any) => ({
    data: {
      frontmatter
    }
  })

  const mockCtx = {}
  const mockTree = {}

  describe('Explicit Publishing Logic', () => {
    it('should publish content with publish: true', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: true })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should publish content with publish: "true"', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: "true" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })

    it('should not publish content with publish: false', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: false })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should not publish content with publish: "false"', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: "false" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should not publish content without publish frontmatter', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ title: "Regular Post" })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should not publish content with undefined publish value', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: undefined })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should not publish content with null publish value', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: null })
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined frontmatter', () => {
      const plugin = ExplicitPublish()
      const vfile = { data: { frontmatter: undefined } }
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should handle null frontmatter', () => {
      const plugin = ExplicitPublish()
      const vfile = { data: { frontmatter: null } }
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should handle empty frontmatter object', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({})
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should handle vfile without data property', () => {
      const plugin = ExplicitPublish()
      const vfile = {}
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(false)
    })

    it('should handle non-boolean publish values', () => {
      const plugin = ExplicitPublish()
      
      // Test with number (truthy but not boolean true)
      const numberVFile = createMockVFile({ publish: 1 })
      expect(plugin.shouldPublish(mockCtx, [mockTree, numberVFile])).toBe(false)
      
      // Test with string (not "true")
      const stringVFile = createMockVFile({ publish: "yes" })
      expect(plugin.shouldPublish(mockCtx, [mockTree, stringVFile])).toBe(false)
      
      // Test with array
      const arrayVFile = createMockVFile({ publish: [] })
      expect(plugin.shouldPublish(mockCtx, [mockTree, arrayVFile])).toBe(false)
      
      // Test with object
      const objectVFile = createMockVFile({ publish: {} })
      expect(plugin.shouldPublish(mockCtx, [mockTree, objectVFile])).toBe(false)
    })
  })

  describe('Combined with Other Frontmatter', () => {
    it('should publish content with publish: true regardless of other frontmatter', () => {
      const plugin = ExplicitPublish()
      
      // Test with draft: true
      const draftVFile = createMockVFile({ publish: true, draft: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, draftVFile])).toBe(true)
      
      // Test with private: true
      const privateVFile = createMockVFile({ publish: true, private: true })
      expect(plugin.shouldPublish(mockCtx, [mockTree, privateVFile])).toBe(true)
      
      // Test with other properties
      const complexVFile = createMockVFile({ 
        publish: true, 
        title: "Test", 
        date: "2024-01-01",
        tags: ["test"] 
      })
      expect(plugin.shouldPublish(mockCtx, [mockTree, complexVFile])).toBe(true)
    })

    it('should not publish content with publish: false regardless of other frontmatter', () => {
      const plugin = ExplicitPublish()
      
      // Test with draft: false
      const draftVFile = createMockVFile({ publish: false, draft: false })
      expect(plugin.shouldPublish(mockCtx, [mockTree, draftVFile])).toBe(false)
      
      // Test with private: false
      const privateVFile = createMockVFile({ publish: false, private: false })
      expect(plugin.shouldPublish(mockCtx, [mockTree, privateVFile])).toBe(false)
      
      // Test with other properties
      const complexVFile = createMockVFile({ 
        publish: false, 
        title: "Test", 
        date: "2024-01-01",
        tags: ["test"] 
      })
      expect(plugin.shouldPublish(mockCtx, [mockTree, complexVFile])).toBe(false)
    })
  })

  describe('Plugin Configuration', () => {
    it('should have correct plugin name', () => {
      const plugin = ExplicitPublish()
      
      expect(plugin.name).toBe('ExplicitPublish')
    })

    it('should be a function that returns a plugin object', () => {
      expect(typeof ExplicitPublish).toBe('function')
      
      const plugin = ExplicitPublish()
      
      expect(typeof plugin).toBe('object')
      expect(typeof plugin.shouldPublish).toBe('function')
      expect(typeof plugin.name).toBe('string')
    })

    it('should not require any configuration parameters', () => {
      // Should work without any arguments
      expect(() => ExplicitPublish()).not.toThrow()
      
      const plugin = ExplicitPublish()
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('ExplicitPublish')
    })
  })

  describe('Performance and Type Safety', () => {
    it('should handle large numbers of calls efficiently', () => {
      const plugin = ExplicitPublish()
      const vfile = createMockVFile({ publish: true })
      
      const iterations = 1000
      const startTime = Date.now()
      
      for (let i = 0; i < iterations; i++) {
        plugin.shouldPublish(mockCtx, [mockTree, vfile])
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 1000 iterations in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('should handle deeply nested frontmatter safely', () => {
      const plugin = ExplicitPublish()
      const vfile = {
        data: {
          frontmatter: {
            publish: true,
            nested: {
              deeply: {
                nested: {
                  value: "should not cause issues"
                }
              }
            }
          }
        }
      }
      
      const result = plugin.shouldPublish(mockCtx, [mockTree, vfile])
      
      expect(result).toBe(true)
    })
  })
})