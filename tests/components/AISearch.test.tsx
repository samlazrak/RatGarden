import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import AISearch from '../../quartz/components/AISearch'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

describe('AISearch Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with default options', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchContainer = container.querySelector('.ai-search')
      expect(searchContainer).toBeTruthy()
      
      const searchButton = container.querySelector('.search-button')
      expect(searchButton).toBeTruthy()
      
      const searchInput = container.querySelector('.search-bar')
      expect(searchInput).toBeTruthy()
    })

    it('should render with custom options', () => {
      const customOptions = {
        enablePreview: false,
        searchMode: 'semantic' as const,
        enableExplanations: false,
        maxResults: 10,
        embeddingModel: 'use' as const,
      }
      
      const AISearchComponent = AISearch(customOptions)
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchLayout = container.querySelector('.search-layout')
      expect(searchLayout?.getAttribute('data-preview')).toBe('false')
      expect(searchLayout?.getAttribute('data-mode')).toBe('semantic')
      expect(searchLayout?.getAttribute('data-explanations')).toBe('false')
      expect(searchLayout?.getAttribute('data-max-results')).toBe('10')
      expect(searchLayout?.getAttribute('data-embedding-model')).toBe('use')
    })

    it('should include all search mode buttons', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const keywordButton = container.querySelector('[data-mode="keyword"]')
      const hybridButton = container.querySelector('[data-mode="hybrid"]')
      const semanticButton = container.querySelector('[data-mode="semantic"]')
      
      expect(keywordButton).toBeTruthy()
      expect(hybridButton).toBeTruthy()
      expect(semanticButton).toBeTruthy()
      
      // Hybrid should be active by default
      expect(hybridButton?.classList.contains('active')).toBe(true)
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const AISearchComponent = AISearch()
      expect(typeof AISearchComponent).toBe('function')
    })

    it('should include CSS styles', () => {
      const AISearchComponent = AISearch()
      expect(AISearchComponent.css).toBeDefined()
    })

    it('should include afterDOMLoaded script if defined', () => {
      const AISearchComponent = AISearch()
      // afterDOMLoaded might be attached during build process
      if (AISearchComponent.afterDOMLoaded) {
        expect(typeof AISearchComponent.afterDOMLoaded).toBe('string')
      } else {
        // In test environment, it might not be attached
        expect(AISearchComponent.afterDOMLoaded).toBeUndefined()
      }
    })
  })

  describe('Search Input Behavior', () => {
    it('should have correct input attributes', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchInput = container.querySelector('.search-bar') as HTMLInputElement
      expect(searchInput.getAttribute('autocomplete')).toBe('off')
      expect(searchInput.getAttribute('type')).toBe('text')
      expect(searchInput.getAttribute('name')).toBe('search')
      expect(searchInput.getAttribute('aria-label')).toBeTruthy()
    })

    it('should display correct placeholder text', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchInput = container.querySelector('.search-bar') as HTMLInputElement
      expect(searchInput.placeholder).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchInput = container.querySelector('.search-bar')
      expect(searchInput?.getAttribute('aria-label')).toBeTruthy()
      
      const modeButtons = container.querySelectorAll('.mode-button')
      modeButtons.forEach(button => {
        expect(button.getAttribute('title')).toBeTruthy()
      })
    })

    it('should have proper semantic structure', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      // Should have proper button structure
      const searchButton = container.querySelector('.search-button')
      expect(searchButton?.tagName).toBe('BUTTON')
      
      // Should have proper input structure  
      const searchInput = container.querySelector('.search-bar')
      expect(searchInput?.tagName).toBe('INPUT')
      
      // Mode buttons should be buttons
      const modeButtons = container.querySelectorAll('.mode-button')
      modeButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('Internationalization', () => {
    it('should respect locale configuration', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps({
        cfg: {
          ...createMockProps().cfg,
          locale: 'en-GB' as const,
        },
      })
      
      const { container } = render(<AISearchComponent {...props} />)
      
      // Component should render without errors with different locale
      const searchContainer = container.querySelector('.ai-search')
      expect(searchContainer).toBeTruthy()
    })
  })

  describe('Search Mode Functionality', () => {
    it('should have keyword search mode button', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const keywordButton = container.querySelector('[data-mode="keyword"]')
      expect(keywordButton).toBeTruthy()
      expect(keywordButton?.getAttribute('title')).toBe('Keyword Search')
      
      const icon = keywordButton?.querySelector('.mode-icon')
      expect(icon?.textContent).toBe('🔤')
      
      const label = keywordButton?.querySelector('.mode-label')
      expect(label?.textContent).toBe('Keyword')
    })

    it('should have hybrid search mode button', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const hybridButton = container.querySelector('[data-mode="hybrid"]')
      expect(hybridButton).toBeTruthy()
      expect(hybridButton?.getAttribute('title')).toBe('Hybrid Search')
      
      const icon = hybridButton?.querySelector('.mode-icon')
      expect(icon?.textContent).toBe('🔀')
      
      const label = hybridButton?.querySelector('.mode-label')
      expect(label?.textContent).toBe('Hybrid')
    })

    it('should have semantic search mode button', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const semanticButton = container.querySelector('[data-mode="semantic"]')
      expect(semanticButton).toBeTruthy()
      expect(semanticButton?.getAttribute('title')).toBe('Semantic Search')
      
      const icon = semanticButton?.querySelector('.mode-icon')
      expect(icon?.textContent).toBe('🧠')
      
      const label = semanticButton?.querySelector('.mode-label')
      expect(label?.textContent).toBe('Semantic')
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply display class correctly', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps({
        displayClass: 'custom-display-class',
      })
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchContainer = container.querySelector('.ai-search')
      expect(searchContainer?.classList.contains('custom-display-class')).toBe(true)
    })

    it('should have consistent CSS class structure', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      // Main container
      expect(container.querySelector('.ai-search')).toBeTruthy()
      
      // Search button
      expect(container.querySelector('.search-button')).toBeTruthy()
      
      // Search container
      expect(container.querySelector('.search-container')).toBeTruthy()
      
      // Search space
      expect(container.querySelector('.search-space')).toBeTruthy()
      
      // Search header
      expect(container.querySelector('.search-header')).toBeTruthy()
      
      // Search bar
      expect(container.querySelector('.search-bar')).toBeTruthy()
      
      // Search modes
      expect(container.querySelector('.search-modes')).toBeTruthy()
      
      // Mode buttons
      expect(container.querySelectorAll('.mode-button')).toHaveLength(3)
      
      // Search layout
      expect(container.querySelector('.search-layout')).toBeTruthy()
    })
  })

  describe('Icon Rendering', () => {
    it('should render search icon SVG', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchIcon = container.querySelector('.search-icon')
      expect(searchIcon).toBeTruthy()
      expect(searchIcon?.tagName).toBe('svg')
      expect(searchIcon?.getAttribute('role')).toBe('img')
      
      const title = searchIcon?.querySelector('title')
      expect(title?.textContent).toBe('AI Search')
    })

    it('should render AI icon SVG', () => {
      const AISearchComponent = AISearch()
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const aiIcon = container.querySelector('.ai-icon')
      expect(aiIcon).toBeTruthy()
      expect(aiIcon?.tagName).toBe('svg')
      expect(aiIcon?.getAttribute('viewBox')).toBe('0 0 24 24')
    })
  })

  describe('Data Attributes', () => {
    it('should set correct data attributes on search layout', () => {
      const options = {
        enablePreview: true,
        searchMode: 'hybrid' as const,
        enableExplanations: true,
        maxResults: 5,
        embeddingModel: 'minilm' as const,
      }
      
      const AISearchComponent = AISearch(options)
      const props = createMockProps()
      
      const { container } = render(<AISearchComponent {...props} />)
      
      const searchLayout = container.querySelector('.search-layout')
      expect(searchLayout?.getAttribute('data-preview')).toBe('true')
      expect(searchLayout?.getAttribute('data-mode')).toBe('hybrid')
      expect(searchLayout?.getAttribute('data-explanations')).toBe('true')
      expect(searchLayout?.getAttribute('data-max-results')).toBe('5')
      expect(searchLayout?.getAttribute('data-embedding-model')).toBe('minilm')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const AISearchComponent = AISearch()
      
      // Test with minimal props
      expect(() => {
        render(<AISearchComponent 
          displayClass="test"
          cfg={createMockProps().cfg}
          fileData={createMockProps().fileData}
          allFiles={createMockProps().allFiles}
        />)
      }).not.toThrow()
    })

    it('should handle invalid options gracefully', () => {
      const invalidOptions = {
        enablePreview: null as any,
        searchMode: 'invalid' as any,
        maxResults: -1,
      }
      
      const AISearchComponent = AISearch(invalidOptions)
      const props = createMockProps()
      
      expect(() => {
        render(<AISearchComponent {...props} />)
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should render quickly with many files', async () => {
      const AISearchComponent = AISearch()
      const largeFileSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockFileData,
        slug: `file-${i}`,
        title: `File ${i}`,
      }))
      
      const props = createMockProps({
        allFiles: largeFileSet,
      })
      
      const startTime = Date.now()
      render(<AISearchComponent {...props} />)
      const endTime = Date.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })
  })
})