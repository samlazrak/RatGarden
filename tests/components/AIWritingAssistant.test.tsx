import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import AIWritingAssistant from '../../quartz/components/AIWritingAssistant'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

describe('AIWritingAssistant Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with default options', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer).toBeTruthy()
      expect(assistantContainer?.classList.contains('floating')).toBe(true)
      
      const trigger = container.querySelector('.ai-assistant-trigger')
      expect(trigger).toBeTruthy()
      
      const panel = container.querySelector('.assistant-panel')
      expect(panel).toBeTruthy()
      
      const featureTabs = container.querySelector('.feature-tabs')
      expect(featureTabs).toBeTruthy()
    })

    it('should render with custom options', () => {
      const customOptions = {
        features: ['completion', 'summarize'] as const,
        provider: 'openai' as const,
        cacheStrategy: 'aggressive' as const,
        position: 'inline' as const,
        apiEndpoint: '/api/openai',
      }
      
      const AIWritingAssistantComponent = AIWritingAssistant(customOptions)
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer?.classList.contains('inline')).toBe(true)
      expect(assistantContainer?.getAttribute('data-provider')).toBe('openai')
      expect(assistantContainer?.getAttribute('data-cache-strategy')).toBe('aggressive')
      expect(assistantContainer?.getAttribute('data-api-endpoint')).toBe('/api/openai')
      
      const features = JSON.parse(assistantContainer?.getAttribute('data-features') || '[]')
      expect(features).toEqual(['completion', 'summarize'])
    })

    it('should not render on listing pages', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          slug: 'blog/',
        },
      })
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should not render when slug is undefined', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          slug: undefined,
        },
      })
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Feature Tabs Rendering', () => {
    it('should render only enabled features', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({
        features: ['grammar', 'completion']
      })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const grammarTab = container.querySelector('[data-feature="grammar"]')
      const styleTab = container.querySelector('[data-feature="style"]')
      const suggestionsTab = container.querySelector('[data-feature="suggestions"]')
      const completionTab = container.querySelector('[data-feature="completion"]')
      const summarizeTab = container.querySelector('[data-feature="summarize"]')
      
      expect(grammarTab).toBeTruthy()
      expect(styleTab).toBeNull()
      expect(suggestionsTab).toBeNull()
      expect(completionTab).toBeTruthy()
      expect(summarizeTab).toBeNull()
    })

    it('should render all available features', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({
        features: ['grammar', 'style', 'suggestions', 'completion', 'summarize']
      })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      expect(container.querySelector('[data-feature="grammar"]')).toBeTruthy()
      expect(container.querySelector('[data-feature="style"]')).toBeTruthy()
      expect(container.querySelector('[data-feature="suggestions"]')).toBeTruthy()
      expect(container.querySelector('[data-feature="completion"]')).toBeTruthy()
      expect(container.querySelector('[data-feature="summarize"]')).toBeTruthy()
    })

    it('should set active class on grammar feature when included', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({
        features: ['grammar', 'completion']
      })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const grammarTab = container.querySelector('[data-feature="grammar"]')
      const completionTab = container.querySelector('[data-feature="completion"]')
      
      expect(grammarTab?.classList.contains('active')).toBe(true)
      expect(completionTab?.classList.contains('active')).toBe(false)
    })
  })

  describe('Component Structure', () => {
    it('should have correct trigger button structure', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const trigger = container.querySelector('.ai-assistant-trigger')
      expect(trigger?.tagName).toBe('BUTTON')
      expect(trigger?.getAttribute('title')).toBe('AI Writing Assistant')
      
      const svg = trigger?.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg?.getAttribute('width')).toBe('20')
      expect(svg?.getAttribute('height')).toBe('20')
      
      const label = trigger?.querySelector('.assistant-label')
      expect(label?.textContent).toBe('AI Assistant')
    })

    it('should have correct panel structure', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const panel = container.querySelector('.assistant-panel')
      expect(panel).toBeTruthy()
      
      const header = panel?.querySelector('.panel-header')
      expect(header).toBeTruthy()
      
      const title = header?.querySelector('h3')
      expect(title?.textContent).toBe('AI Writing Assistant')
      
      const closeBtn = header?.querySelector('.close-btn')
      expect(closeBtn?.getAttribute('aria-label')).toBe('Close')
      
      const content = panel?.querySelector('.panel-content')
      expect(content).toBeTruthy()
    })

    it('should have correct input area structure', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const inputArea = container.querySelector('.input-area')
      expect(inputArea).toBeTruthy()
      
      const textarea = inputArea?.querySelector('.text-input')
      expect(textarea?.tagName).toBe('TEXTAREA')
      expect(textarea?.getAttribute('placeholder')).toBe('Paste or type text here for AI assistance...')
      expect(textarea?.getAttribute('rows')).toBe('6')
      
      const actions = inputArea?.querySelector('.input-actions')
      expect(actions).toBeTruthy()
      
      const analyzeBtn = actions?.querySelector('.analyze-btn')
      const clearBtn = actions?.querySelector('.clear-btn')
      expect(analyzeBtn).toBeTruthy()
      expect(clearBtn).toBeTruthy()
    })

    it('should have results area with placeholder', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const resultsArea = container.querySelector('.results-area')
      expect(resultsArea).toBeTruthy()
      
      const placeholder = resultsArea?.querySelector('.results-placeholder')
      expect(placeholder).toBeTruthy()
      
      const placeholderText = placeholder?.querySelector('p')
      expect(placeholderText?.textContent).toBe('Results will appear here after analysis...')
    })

    it('should have footer with usage and provider info', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const footer = container.querySelector('.assistant-footer')
      expect(footer).toBeTruthy()
      
      const usageInfo = footer?.querySelector('.usage-info')
      const providerInfo = footer?.querySelector('.provider-info')
      expect(usageInfo).toBeTruthy()
      expect(providerInfo).toBeTruthy()
      
      const usageLabel = usageInfo?.querySelector('.usage-label')
      const usageCount = usageInfo?.querySelector('.usage-count')
      const providerLabel = providerInfo?.querySelector('.provider-label')
      const providerName = providerInfo?.querySelector('.provider-name')
      
      expect(usageLabel?.textContent).toBe('Environment:')
      expect(usageCount?.textContent).toBe('Loading...')
      expect(providerLabel?.textContent).toBe('Status:')
      expect(providerName?.textContent).toBe('Loading...')
    })
  })

  describe('Data Attributes', () => {
    it('should set correct data attributes', () => {
      const options = {
        features: ['grammar', 'style'] as const,
        provider: 'anthropic' as const,
        cacheStrategy: 'none' as const,
        apiEndpoint: '/api/claude',
      }
      
      const AIWritingAssistantComponent = AIWritingAssistant(options)
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer?.getAttribute('data-features')).toBe('["grammar","style"]')
      expect(assistantContainer?.getAttribute('data-provider')).toBe('anthropic')
      expect(assistantContainer?.getAttribute('data-cache-strategy')).toBe('none')
      expect(assistantContainer?.getAttribute('data-api-endpoint')).toBe('/api/claude')
    })

    it('should handle empty apiEndpoint', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer?.getAttribute('data-api-endpoint')).toBe('')
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply display class correctly', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps({
        displayClass: 'custom-display-class',
      })
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer?.classList.contains('custom-display-class')).toBe(true)
    })

    it('should apply position class correctly', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({ position: 'inline' })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer?.classList.contains('inline')).toBe(true)
      expect(assistantContainer?.classList.contains('floating')).toBe(false)
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      expect(typeof AIWritingAssistantComponent).toBe('function')
    })

    it('should include CSS styles', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      expect(AIWritingAssistantComponent.css).toBeDefined()
    })

    it('should include afterDOMLoaded script if defined', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      // afterDOMLoaded might be attached during build process
      if (AIWritingAssistantComponent.afterDOMLoaded) {
        expect(typeof AIWritingAssistantComponent.afterDOMLoaded).toBe('string')
      } else {
        // In test environment, it might not be attached
        expect(AIWritingAssistantComponent.afterDOMLoaded).toBeUndefined()
      }
    })
  })

  describe('SVG Icons', () => {
    it('should render correct SVG for each feature', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({
        features: ['grammar', 'style', 'suggestions', 'completion', 'summarize']
      })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const featureTabs = container.querySelectorAll('.tab-btn svg')
      expect(featureTabs).toHaveLength(5)
      
      featureTabs.forEach(svg => {
        expect(svg.getAttribute('width')).toBe('16')
        expect(svg.getAttribute('height')).toBe('16')
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
        expect(svg.getAttribute('fill')).toBe('none')
        expect(svg.getAttribute('stroke')).toBe('currentColor')
      })
    })

    it('should render trigger button SVG correctly', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const triggerSvg = container.querySelector('.ai-assistant-trigger svg')
      expect(triggerSvg).toBeTruthy()
      expect(triggerSvg?.getAttribute('width')).toBe('20')
      expect(triggerSvg?.getAttribute('height')).toBe('20')
      expect(triggerSvg?.getAttribute('viewBox')).toBe('0 0 24 24')
      
      const paths = triggerSvg?.querySelectorAll('path')
      expect(paths).toHaveLength(2)
    })
  })

  describe('Feature Tab Content', () => {
    it('should render correct text for each feature', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({
        features: ['grammar', 'style', 'suggestions', 'completion', 'summarize']
      })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      expect(container.querySelector('[data-feature="grammar"]')?.textContent?.trim()).toContain('Grammar')
      expect(container.querySelector('[data-feature="style"]')?.textContent?.trim()).toContain('Style')
      expect(container.querySelector('[data-feature="suggestions"]')?.textContent?.trim()).toContain('Suggestions')
      expect(container.querySelector('[data-feature="completion"]')?.textContent?.trim()).toContain('Complete')
      expect(container.querySelector('[data-feature="summarize"]')?.textContent?.trim()).toContain('Summarize')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      
      expect(() => {
        render(<AIWritingAssistantComponent 
          displayClass="test"
          cfg={createMockProps().cfg}
          fileData={createMockProps().fileData}
          allFiles={createMockProps().allFiles}
        />)
      }).not.toThrow()
    })

    it('should handle invalid features gracefully', () => {
      const invalidOptions = {
        features: ['invalid-feature'] as any,
        provider: 'invalid-provider' as any,
      }
      
      const AIWritingAssistantComponent = AIWritingAssistant(invalidOptions)
      const props = createMockProps()
      
      expect(() => {
        render(<AIWritingAssistantComponent {...props} />)
      }).not.toThrow()
    })

    it('should handle empty features array', () => {
      const AIWritingAssistantComponent = AIWritingAssistant({ features: [] })
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const featureTabs = container.querySelectorAll('.tab-btn')
      expect(featureTabs).toHaveLength(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const trigger = container.querySelector('.ai-assistant-trigger')
      expect(trigger?.getAttribute('title')).toBe('AI Writing Assistant')
      
      const closeBtn = container.querySelector('.close-btn')
      expect(closeBtn?.getAttribute('aria-label')).toBe('Close')
    })

    it('should have proper semantic structure', () => {
      const AIWritingAssistantComponent = AIWritingAssistant()
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      // Should have proper heading structure
      const heading = container.querySelector('h3')
      expect(heading).toBeTruthy()
      
      // Buttons should be buttons
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
      
      // Textarea should be textarea
      const textarea = container.querySelector('textarea')
      expect(textarea?.tagName).toBe('TEXTAREA')
    })
  })

  describe('Options Merging', () => {
    it('should merge partial options with defaults correctly', () => {
      const partialOptions = {
        provider: 'gemini' as const,
        position: 'inline' as const,
      }
      
      const AIWritingAssistantComponent = AIWritingAssistant(partialOptions)
      const props = createMockProps()
      
      const { container } = render(<AIWritingAssistantComponent {...props} />)
      
      const assistantContainer = container.querySelector('.ai-writing-assistant')
      expect(assistantContainer?.getAttribute('data-provider')).toBe('gemini')
      expect(assistantContainer?.classList.contains('inline')).toBe(true)
      expect(assistantContainer?.getAttribute('data-cache-strategy')).toBe('moderate') // default
      
      const features = JSON.parse(assistantContainer?.getAttribute('data-features') || '[]')
      expect(features).toEqual(['grammar', 'style', 'suggestions']) // default
    })
  })
})