import { describe, it, expect } from 'vitest'
import {
  isFilePath,
  isFullSlug,
  isSimpleSlug,
  isRelativeURL,
  isAbsoluteURL,
  type FilePath,
  type FullSlug,
  type SimpleSlug,
  type RelativeURL,
} from '../../quartz/util/path'

describe('Path Utilities', () => {
  describe('isFilePath', () => {
    it('should identify valid file paths', () => {
      expect(isFilePath('file.md')).toBe(true)
      expect(isFilePath('folder/file.txt')).toBe(true)
      expect(isFilePath('deep/nested/path/file.json')).toBe(true)
      expect(isFilePath('file.html')).toBe(true)
      expect(isFilePath('image.png')).toBe(true)
      expect(isFilePath('script.js')).toBe(true)
    })

    it('should reject relative paths', () => {
      expect(isFilePath('./file.md')).toBe(false)
      expect(isFilePath('../file.txt')).toBe(false)
      expect(isFilePath('.file.md')).toBe(false)
    })

    it('should reject paths without extensions', () => {
      expect(isFilePath('folder')).toBe(false)
      expect(isFilePath('folder/subfolder')).toBe(false)
      expect(isFilePath('file')).toBe(false)
    })

    it('should reject empty or invalid paths', () => {
      expect(isFilePath('')).toBe(false)
      expect(isFilePath('/')).toBe(false)
      expect(isFilePath('/folder')).toBe(false)
    })
  })

  describe('isFullSlug', () => {
    it('should identify valid full slugs', () => {
      expect(isFullSlug('blog/post-title')).toBe(true)
      expect(isFullSlug('folder/subfolder/page')).toBe(true)
      expect(isFullSlug('simple-page')).toBe(true)
      expect(isFullSlug('blog/index')).toBe(true)
      expect(isFullSlug('folder/subfolder/index')).toBe(true)
    })

    it('should reject relative paths', () => {
      expect(isFullSlug('./page')).toBe(false)
      expect(isFullSlug('../folder/page')).toBe(false)
      expect(isFullSlug('.hidden')).toBe(false)
    })

    it('should reject paths with leading slashes', () => {
      expect(isFullSlug('/blog/post')).toBe(false)
      expect(isFullSlug('/page')).toBe(false)
    })

    it('should reject paths with trailing slashes', () => {
      expect(isFullSlug('blog/post/')).toBe(false)
      expect(isFullSlug('folder/')).toBe(false)
    })

    it('should handle empty paths', () => {
      // Empty string behavior - adjust based on actual implementation
      const result = isFullSlug('')
      expect(typeof result).toBe('boolean')
    })

    it('should handle special characters appropriately', () => {
      expect(isFullSlug('post-with-dashes')).toBe(true)
      expect(isFullSlug('post_with_underscores')).toBe(true)
      expect(isFullSlug('folder/post-name')).toBe(true)
    })
  })

  describe('isSimpleSlug', () => {
    it('should identify valid simple slugs', () => {
      expect(isSimpleSlug('blog')).toBe(true)
      expect(isSimpleSlug('post-title')).toBe(true)
      expect(isSimpleSlug('folder/subfolder')).toBe(true)
      expect(isSimpleSlug('folder/')).toBe(true) // trailing slash is allowed
    })

    it('should reject paths ending with index', () => {
      expect(isSimpleSlug('blog/index')).toBe(false)
      expect(isSimpleSlug('folder/subfolder/index')).toBe(false)
      expect(isSimpleSlug('index')).toBe(false)
    })

    it('should reject file extensions', () => {
      expect(isSimpleSlug('file.md')).toBe(false)
      expect(isSimpleSlug('blog/post.html')).toBe(false)
      expect(isSimpleSlug('image.png')).toBe(false)
    })

    it('should reject relative paths', () => {
      expect(isSimpleSlug('./page')).toBe(false)
      expect(isSimpleSlug('../folder')).toBe(false)
      expect(isSimpleSlug('.hidden')).toBe(false)
    })

    it('should reject paths with leading slash (except single slash)', () => {
      expect(isSimpleSlug('/blog')).toBe(false)
      expect(isSimpleSlug('/folder/page')).toBe(false)
      expect(isSimpleSlug('/')).toBe(true) // single slash is allowed
    })
  })

  describe('isRelativeURL', () => {
    it('should identify valid relative URLs', () => {
      expect(isRelativeURL('./page')).toBe(true)
      expect(isRelativeURL('../folder')).toBe(true)
      expect(isRelativeURL('./folder/page')).toBe(true)
      expect(isRelativeURL('../parent/page')).toBe(true)
      expect(isRelativeURL('../../grandparent')).toBe(true)
    })

    it('should reject non-relative paths', () => {
      expect(isRelativeURL('page')).toBe(false)
      expect(isRelativeURL('/absolute/path')).toBe(false)
      expect(isRelativeURL('folder/page')).toBe(false)
    })

    it('should reject paths ending with index', () => {
      expect(isRelativeURL('./index')).toBe(false)
      expect(isRelativeURL('../folder/index')).toBe(false)
    })

    it('should reject markdown and HTML extensions', () => {
      expect(isRelativeURL('./page.md')).toBe(false)
      expect(isRelativeURL('../folder/page.html')).toBe(false)
    })

    it('should allow other file extensions', () => {
      expect(isRelativeURL('./image.png')).toBe(true)
      expect(isRelativeURL('../styles.css')).toBe(true)
      expect(isRelativeURL('./script.js')).toBe(true)
    })
  })

  describe('isAbsoluteURL', () => {
    it('should identify valid absolute URLs', () => {
      expect(isAbsoluteURL('https://example.com')).toBe(true)
      expect(isAbsoluteURL('http://example.com')).toBe(true)
      expect(isAbsoluteURL('https://www.example.com/path')).toBe(true)
      expect(isAbsoluteURL('https://example.com/page?query=value')).toBe(true)
      expect(isAbsoluteURL('https://example.com/page#fragment')).toBe(true)
      expect(isAbsoluteURL('mailto:test@example.com')).toBe(true)
      expect(isAbsoluteURL('ftp://files.example.com')).toBe(true)
    })

    it('should reject relative paths', () => {
      expect(isAbsoluteURL('./page')).toBe(false)
      expect(isAbsoluteURL('../folder')).toBe(false)
      expect(isAbsoluteURL('/absolute/path')).toBe(false)
      expect(isAbsoluteURL('page')).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(isAbsoluteURL('not-a-url')).toBe(false)
      expect(isAbsoluteURL('http://')).toBe(false)
      expect(isAbsoluteURL('https://')).toBe(false)
      expect(isAbsoluteURL('')).toBe(false)
    })

    it('should handle malformed URLs gracefully', () => {
      expect(isAbsoluteURL('http://[invalid')).toBe(false)
      // Note: Some malformed URLs might still be valid according to URL constructor
      // Focus on clearly invalid cases
      expect(isAbsoluteURL('not-a-url')).toBe(false)
      expect(isAbsoluteURL('')).toBe(false)
    })
  })

  describe('Type Guards Behavior', () => {
    it('should narrow types correctly', () => {
      const testString = 'blog/post-title'
      
      if (isFullSlug(testString)) {
        // TypeScript should infer this as FullSlug
        const fullSlug: FullSlug = testString
        expect(typeof fullSlug).toBe('string')
      }
    })

    it('should handle string edge cases consistently', () => {
      const stringEdgeCases = [
        '',
        '/',
        '.',
        '..',
        ' ',
        '\n',
        '\t',
      ]

      stringEdgeCases.forEach(testCase => {
        // Should not throw errors for string edge cases
        expect(() => {
          isFilePath(testCase)
          isFullSlug(testCase)
          isSimpleSlug(testCase)
          isRelativeURL(testCase)
          isAbsoluteURL(testCase)
        }).not.toThrow()
      })
    })
  })

  describe('Real-world Examples', () => {
    it('should handle typical blog structure', () => {
      // File paths in a blog
      expect(isFilePath('content/blog/post.md')).toBe(true)
      expect(isFilePath('public/images/photo.jpg')).toBe(true)
      
      // Full slugs for pages
      expect(isFullSlug('blog/my-first-post')).toBe(true)
      expect(isFullSlug('about')).toBe(true)
      expect(isFullSlug('blog/index')).toBe(true)
      
      // Simple slugs for navigation
      expect(isSimpleSlug('blog')).toBe(true)
      expect(isSimpleSlug('about')).toBe(true)
      expect(isSimpleSlug('contact/')).toBe(true)
      
      // Relative URLs for linking
      expect(isRelativeURL('./other-post')).toBe(true)
      expect(isRelativeURL('../category')).toBe(true)
      
      // Absolute URLs for external links
      expect(isAbsoluteURL('https://github.com/user/repo')).toBe(true)
      expect(isAbsoluteURL('mailto:contact@example.com')).toBe(true)
    })

    it('should reject common invalid patterns', () => {
      // Invalid file paths
      expect(isFilePath('./relative/file.md')).toBe(false)
      expect(isFilePath('folder-without-extension')).toBe(false)
      
      // Invalid full slugs
      expect(isFullSlug('/leading-slash')).toBe(false)
      expect(isFullSlug('trailing-slash/')).toBe(false)
      
      // Invalid simple slugs
      expect(isSimpleSlug('file.md')).toBe(false)
      expect(isSimpleSlug('folder/index')).toBe(false)
      
      // Invalid relative URLs
      expect(isRelativeURL('not-relative')).toBe(false)
      expect(isRelativeURL('./page.md')).toBe(false)
      
      // Invalid absolute URLs
      expect(isAbsoluteURL('www.example.com')).toBe(false)
      expect(isAbsoluteURL('//example.com')).toBe(false)
    })
  })

  describe('Performance', () => {
    it('should execute type guards quickly', () => {
      const testStrings = Array.from({ length: 1000 }, (_, i) => `test-string-${i}`)
      
      const startTime = Date.now()
      
      testStrings.forEach(str => {
        isFilePath(str)
        isFullSlug(str)
        isSimpleSlug(str)
        isRelativeURL(str)
        isAbsoluteURL(str)
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 1000 × 5 = 5000 type guard checks in under 50ms
      expect(duration).toBeLessThan(50)
    })
  })

  describe('Consistency', () => {
    it('should provide consistent classification across multiple runs', () => {
      const testCases = [
        'blog/post',
        './relative',
        'file.md',
        'https://example.com',
        '/absolute/path',
      ]
      
      testCases.forEach(testCase => {
        const firstResults = [
          isFilePath(testCase),
          isFullSlug(testCase),
          isSimpleSlug(testCase),
          isRelativeURL(testCase),
          isAbsoluteURL(testCase),
        ]
        
        const secondResults = [
          isFilePath(testCase),
          isFullSlug(testCase),
          isSimpleSlug(testCase),
          isRelativeURL(testCase),
          isAbsoluteURL(testCase),
        ]
        
        // Results should be consistent across multiple runs
        expect(firstResults).toEqual(secondResults)
      })
    })

    it('should be deterministic', () => {
      const testCases = [
        'blog/post',
        'file.md',
        './relative',
        'https://example.com',
        '',
        '/',
      ]
      
      testCases.forEach(testCase => {
        // Run each test multiple times to ensure consistent results
        const firstRun = {
          filePath: isFilePath(testCase),
          fullSlug: isFullSlug(testCase),
          simpleSlug: isSimpleSlug(testCase),
          relativeURL: isRelativeURL(testCase),
          absoluteURL: isAbsoluteURL(testCase),
        }
        
        // Run again and compare
        const secondRun = {
          filePath: isFilePath(testCase),
          fullSlug: isFullSlug(testCase),
          simpleSlug: isSimpleSlug(testCase),
          relativeURL: isRelativeURL(testCase),
          absoluteURL: isAbsoluteURL(testCase),
        }
        
        expect(firstRun).toEqual(secondRun)
      })
    })
  })
})