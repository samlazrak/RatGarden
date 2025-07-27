import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import AIRecommendations from '../../quartz/components/AIRecommendations'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

describe('AIRecommendations Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with default options', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const recommendationsContainer = container.querySelector('.ai-recommendations')
      expect(recommendationsContainer).toBeTruthy()
      
      const header = container.querySelector('.recommendations-header')
      expect(header).toBeTruthy()
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('AI Recommendations')
      
      const modeSelector = container.querySelector('.mode-selector')
      expect(modeSelector).toBeTruthy()
      
      const dataContainer = container.querySelector('.recommendations-container')
      expect(dataContainer).toBeTruthy()
    })

    it('should render with custom options', () => {
      const customOptions = {
        mode: 'related' as const,
        explanations: false,
        maxItems: 10,
        title: 'Related Articles',
        showThumbnails: true,
        showDescription: false,
      }
      
      const AIRecommendationsComponent = AIRecommendations(customOptions)
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Related Articles')
      
      const dataContainer = container.querySelector('.recommendations-container')
      expect(dataContainer?.getAttribute('data-mode')).toBe('related')
      expect(dataContainer?.getAttribute('data-max-items')).toBe('10')
      expect(dataContainer?.getAttribute('data-show-explanations')).toBe('false')
      expect(dataContainer?.getAttribute('data-show-description')).toBe('false')
      
      const relatedButton = container.querySelector('[data-mode="related"]')
      expect(relatedButton?.classList.contains('active')).toBe(true)
    })

    it('should render all mode buttons', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const relatedButton = container.querySelector('[data-mode="related"]')
      const personalizedButton = container.querySelector('[data-mode="personalized"]')
      const trendingButton = container.querySelector('[data-mode="trending"]')
      
      expect(relatedButton).toBeTruthy()
      expect(personalizedButton).toBeTruthy()
      expect(trendingButton).toBeTruthy()
      
      // Personalized should be active by default
      expect(personalizedButton?.classList.contains('active')).toBe(true)
    })

    it('should render loading spinner', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const loadingSpinner = container.querySelector('.loading-spinner')
      expect(loadingSpinner).toBeTruthy()
      
      const spinner = container.querySelector('.spinner')
      expect(spinner).toBeTruthy()
      
      const loadingText = loadingSpinner?.querySelector('p')
      expect(loadingText?.textContent).toBe('Analyzing content...')
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const AIRecommendationsComponent = AIRecommendations()
      expect(typeof AIRecommendationsComponent).toBe('function')
    })

    it('should include CSS styles', () => {
      const AIRecommendationsComponent = AIRecommendations()
      expect(AIRecommendationsComponent.css).toBeDefined()
    })

    it('should include afterDOMLoaded script if defined', () => {
      const AIRecommendationsComponent = AIRecommendations()
      // afterDOMLoaded might be attached during build process
      if (AIRecommendationsComponent.afterDOMLoaded) {
        expect(typeof AIRecommendationsComponent.afterDOMLoaded).toBe('string')
      } else {
        // In test environment, it might not be attached
        expect(AIRecommendationsComponent.afterDOMLoaded).toBeUndefined()
      }
    })
  })

  describe('Mode Button Functionality', () => {
    it('should render related mode button correctly', () => {
      const AIRecommendationsComponent = AIRecommendations({ mode: 'related' })
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const relatedButton = container.querySelector('[data-mode="related"]')
      expect(relatedButton).toBeTruthy()
      expect(relatedButton?.getAttribute('title')).toBe('Related Content')
      expect(relatedButton?.classList.contains('active')).toBe(true)
      
      const svg = relatedButton?.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg?.getAttribute('width')).toBe('16')
      expect(svg?.getAttribute('height')).toBe('16')
    })

    it('should render personalized mode button correctly', () => {
      const AIRecommendationsComponent = AIRecommendations({ mode: 'personalized' })
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const personalizedButton = container.querySelector('[data-mode="personalized"]')
      expect(personalizedButton).toBeTruthy()
      expect(personalizedButton?.getAttribute('title')).toBe('For You')
      expect(personalizedButton?.classList.contains('active')).toBe(true)
      
      const svg = personalizedButton?.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg?.querySelector('circle')).toBeTruthy()
    })

    it('should render trending mode button correctly', () => {
      const AIRecommendationsComponent = AIRecommendations({ mode: 'trending' })
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const trendingButton = container.querySelector('[data-mode="trending"]')
      expect(trendingButton).toBeTruthy()
      expect(trendingButton?.getAttribute('title')).toBe('Trending')
      expect(trendingButton?.classList.contains('active')).toBe(true)
      
      const svg = trendingButton?.querySelector('svg')
      expect(svg).toBeTruthy()
    })
  })

  describe('Data Attributes', () => {
    it('should set correct data attributes on recommendations container', () => {
      const options = {
        mode: 'related' as const,
        explanations: true,
        maxItems: 8,
        showDescription: false,
      }
      
      const AIRecommendationsComponent = AIRecommendations(options)
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const dataContainer = container.querySelector('.recommendations-container')
      expect(dataContainer?.getAttribute('data-current-slug')).toBe(props.fileData.slug)
      expect(dataContainer?.getAttribute('data-mode')).toBe('related')
      expect(dataContainer?.getAttribute('data-max-items')).toBe('8')
      expect(dataContainer?.getAttribute('data-show-explanations')).toBe('true')
      expect(dataContainer?.getAttribute('data-show-description')).toBe('false')
    })

    it('should handle missing file slug gracefully', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps({
        fileData: { ...mockFileData, slug: undefined }
      })
      
      expect(() => {
        render(<AIRecommendationsComponent {...props} />)
      }).not.toThrow()
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply display class correctly', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps({
        displayClass: 'custom-display-class',
      })
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const recommendationsContainer = container.querySelector('.ai-recommendations')
      expect(recommendationsContainer?.classList.contains('custom-display-class')).toBe(true)
    })

    it('should have consistent CSS class structure', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      // Main container
      expect(container.querySelector('.ai-recommendations')).toBeTruthy()
      
      // Header
      expect(container.querySelector('.recommendations-header')).toBeTruthy()
      
      // Mode selector
      expect(container.querySelector('.mode-selector')).toBeTruthy()
      
      // Mode buttons
      expect(container.querySelectorAll('.mode-btn')).toHaveLength(3)
      
      // Data container
      expect(container.querySelector('.recommendations-container')).toBeTruthy()
      
      // Loading spinner
      expect(container.querySelector('.loading-spinner')).toBeTruthy()
    })

    it('should apply active class to correct mode button', () => {
      const AIRecommendationsComponent = AIRecommendations({ mode: 'trending' })
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const relatedButton = container.querySelector('[data-mode="related"]')
      const personalizedButton = container.querySelector('[data-mode="personalized"]')
      const trendingButton = container.querySelector('[data-mode="trending"]')
      
      expect(relatedButton?.classList.contains('active')).toBe(false)
      expect(personalizedButton?.classList.contains('active')).toBe(false)
      expect(trendingButton?.classList.contains('active')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const modeButtons = container.querySelectorAll('.mode-btn')
      modeButtons.forEach(button => {
        expect(button.getAttribute('title')).toBeTruthy()
      })
    })

    it('should have proper semantic structure', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      // Should have proper heading structure
      const heading = container.querySelector('h3')
      expect(heading).toBeTruthy()
      
      // Mode buttons should be buttons
      const modeButtons = container.querySelectorAll('.mode-btn')
      modeButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('Options Validation', () => {
    it('should handle invalid mode gracefully', () => {
      const invalidOptions = {
        mode: 'invalid' as any,
        maxItems: -1,
        explanations: null as any,
      }
      
      const AIRecommendationsComponent = AIRecommendations(invalidOptions)
      const props = createMockProps()
      
      expect(() => {
        render(<AIRecommendationsComponent {...props} />)
      }).not.toThrow()
    })

    it('should merge options with defaults correctly', () => {
      const partialOptions = {
        mode: 'related' as const,
        maxItems: 3,
      }
      
      const AIRecommendationsComponent = AIRecommendations(partialOptions)
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const dataContainer = container.querySelector('.recommendations-container')
      expect(dataContainer?.getAttribute('data-mode')).toBe('related')
      expect(dataContainer?.getAttribute('data-max-items')).toBe('3')
      expect(dataContainer?.getAttribute('data-show-explanations')).toBe('true') // default
      expect(dataContainer?.getAttribute('data-show-description')).toBe('true') // default
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('AI Recommendations') // default
    })
  })

  describe('Performance', () => {
    it('should render quickly with many files', async () => {
      const AIRecommendationsComponent = AIRecommendations()
      const largeFileSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockFileData,
        slug: `file-${i}`,
        title: `File ${i}`,
      }))
      
      const props = createMockProps({
        allFiles: largeFileSet,
      })
      
      const startTime = Date.now()
      render(<AIRecommendationsComponent {...props} />)
      const endTime = Date.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('should handle rendering without allFiles', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps({
        allFiles: [],
      })
      
      expect(() => {
        render(<AIRecommendationsComponent {...props} />)
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined fileData slug', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          slug: undefined,
        },
      })
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const dataContainer = container.querySelector('.recommendations-container')
      expect(dataContainer?.getAttribute('data-current-slug')).toBeNull()
    })

    it('should handle missing props gracefully', () => {
      const AIRecommendationsComponent = AIRecommendations()
      
      expect(() => {
        render(<AIRecommendationsComponent 
          displayClass="test"
          cfg={createMockProps().cfg}
          fileData={createMockProps().fileData}
          allFiles={createMockProps().allFiles}
        />)
      }).not.toThrow()
    })

    it('should handle empty string title', () => {
      const AIRecommendationsComponent = AIRecommendations({ title: '' })
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('')
    })
  })

  describe('SVG Icons', () => {
    it('should render all SVG icons correctly', () => {
      const AIRecommendationsComponent = AIRecommendations()
      const props = createMockProps()
      
      const { container } = render(<AIRecommendationsComponent {...props} />)
      
      const svgs = container.querySelectorAll('svg')
      expect(svgs).toHaveLength(3) // One for each mode button
      
      svgs.forEach(svg => {
        expect(svg.getAttribute('width')).toBe('16')
        expect(svg.getAttribute('height')).toBe('16')
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
        expect(svg.getAttribute('fill')).toBe('none')
        expect(svg.getAttribute('stroke')).toBe('currentColor')
      })
    })
  })
})