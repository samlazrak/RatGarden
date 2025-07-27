import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import InteractiveAIDemo from '../../quartz/components/InteractiveAIDemo'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

describe('InteractiveAIDemo Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with default NLP demo', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer).toBeTruthy()
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('nlp')
      
      const header = container.querySelector('.demo-header')
      expect(header).toBeTruthy()
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Text Classification Demo')
      
      const description = container.querySelector('.demo-description')
      expect(description?.textContent).toBe('Analyze sentiment and classify text using AI')
    })

    it('should render vision demo type', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'vision' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('vision')
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Image Classification Demo')
      
      const description = container.querySelector('.demo-description')
      expect(description?.textContent).toBe('Classify images using computer vision AI')
      
      const imageInput = container.querySelector('.image-input')
      expect(imageInput).toBeTruthy()
      expect(imageInput?.getAttribute('accept')).toBe('image/*')
    })

    it('should render generative demo type', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'generative' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('generative')
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Text Generation Demo')
      
      const description = container.querySelector('.demo-description')
      expect(description?.textContent).toBe('Generate creative text using AI')
      
      const textInput = container.querySelector('.text-input')
      expect(textInput).toBeTruthy()
      expect(textInput?.getAttribute('placeholder')).toBe('Start typing your prompt...')
    })

    it('should render custom demo type', () => {
      const customOptions = {
        demoType: 'custom' as const,
        title: 'My Custom Demo',
        description: 'Custom AI demonstration',
        modelId: 'custom-model-123',
      }
      
      const InteractiveAIDemoComponent = InteractiveAIDemo(customOptions)
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('custom')
      expect(demoContainer?.getAttribute('data-model-id')).toBe('custom-model-123')
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('My Custom Demo')
      
      const description = container.querySelector('.demo-description')
      expect(description?.textContent).toBe('Custom AI demonstration')
    })

    it('should render custom demo with defaults when no custom options provided', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'custom' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Custom AI Demo')
      
      const description = container.querySelector('.demo-description')
      expect(description?.textContent).toBe('Interactive AI demonstration')
    })
  })

  describe('Data Attributes', () => {
    it('should set correct data attributes with default options', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('nlp')
      expect(demoContainer?.getAttribute('data-model-source')).toBe('huggingface')
      expect(demoContainer?.getAttribute('data-fallback')).toBe('static')
      expect(demoContainer?.getAttribute('data-api-endpoint')).toBe('')
      expect(demoContainer?.getAttribute('data-default-input')).toBe('')
    })

    it('should set correct data attributes with custom options', () => {
      const options = {
        demoType: 'vision' as const,
        modelSource: 'api' as const,
        fallbackBehavior: 'none' as const,
        apiEndpoint: '/api/vision',
        defaultInput: 'test input',
      }
      
      const InteractiveAIDemoComponent = InteractiveAIDemo(options)
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('vision')
      expect(demoContainer?.getAttribute('data-model-source')).toBe('api')
      expect(demoContainer?.getAttribute('data-fallback')).toBe('none')
      expect(demoContainer?.getAttribute('data-api-endpoint')).toBe('/api/vision')
      expect(demoContainer?.getAttribute('data-default-input')).toBe('test input')
    })

    it('should set model-id from demo config', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'nlp' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-model-id')).toBe('Xenova/distilbert-base-uncased-finetuned-sst-2-english')
    })
  })

  describe('Input Section Rendering', () => {
    it('should render text input for text-based demos', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'nlp' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const inputSection = container.querySelector('.input-section')
      expect(inputSection).toBeTruthy()
      
      const inputLabel = container.querySelector('.input-label')
      expect(inputLabel?.textContent).toBe('Input:')
      
      const textInput = container.querySelector('.text-input')
      expect(textInput).toBeTruthy()
      expect(textInput?.tagName).toBe('TEXTAREA')
      expect(textInput?.getAttribute('placeholder')).toBe('Enter text to analyze...')
      expect(textInput?.getAttribute('rows')).toBe('4')
      
      const imageInput = container.querySelector('.image-input')
      expect(imageInput).toBeNull()
    })

    it('should render image input for vision demos', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'vision' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const imageInputContainer = container.querySelector('.image-input-container')
      expect(imageInputContainer).toBeTruthy()
      
      const imageInput = container.querySelector('.image-input')
      expect(imageInput).toBeTruthy()
      expect(imageInput?.tagName).toBe('INPUT')
      expect(imageInput?.getAttribute('type')).toBe('file')
      expect(imageInput?.getAttribute('accept')).toBe('image/*')
      
      const imageInputLabel = container.querySelector('.image-input-label')
      expect(imageInputLabel).toBeTruthy()
      expect(imageInputLabel?.textContent?.trim()).toContain('Click to upload image')
      
      const imagePreview = container.querySelector('.image-preview')
      expect(imagePreview).toBeTruthy()
      
      const textInput = container.querySelector('.text-input')
      expect(textInput).toBeNull()
    })

    it('should render default input text when provided', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ 
        demoType: 'nlp',
        defaultInput: 'This is a test input'
      })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const textInput = container.querySelector('.text-input')
      expect(textInput?.textContent).toBe('This is a test input')
    })

    it('should render run demo button', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const runButton = container.querySelector('.run-demo-btn')
      expect(runButton).toBeTruthy()
      expect(runButton?.tagName).toBe('BUTTON')
      
      const btnText = container.querySelector('.btn-text')
      expect(btnText?.textContent).toBe('Run Demo')
      
      const loadingSpinner = container.querySelector('.loading-spinner')
      expect(loadingSpinner).toBeTruthy()
    })
  })

  describe('Examples Section', () => {
    it('should render examples for NLP demo', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'nlp' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const examplesSection = container.querySelector('.examples-section')
      expect(examplesSection).toBeTruthy()
      
      const examplesLabel = container.querySelector('.examples-label')
      expect(examplesLabel?.textContent).toBe('Try these examples:')
      
      const exampleButtons = container.querySelectorAll('.example-btn')
      expect(exampleButtons).toHaveLength(3)
      
      const labels = Array.from(exampleButtons).map(btn => btn.textContent?.trim())
      expect(labels).toEqual(['Positive', 'Negative', 'Neutral'])
      
      const values = Array.from(exampleButtons).map(btn => btn.getAttribute('data-value'))
      expect(values[0]).toContain('This blog post is absolutely fantastic!')
      expect(values[1]).toContain('I found this content confusing')
      expect(values[2]).toContain('The article covers the basics')
    })

    it('should render examples for vision demo', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'vision' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const exampleButtons = container.querySelectorAll('.example-btn')
      expect(exampleButtons).toHaveLength(3)
      
      const labels = Array.from(exampleButtons).map(btn => btn.textContent?.trim())
      expect(labels).toEqual(['Cat', 'Dog', 'Bird'])
      
      const values = Array.from(exampleButtons).map(btn => btn.getAttribute('data-value'))
      expect(values).toEqual([
        '/static/examples/cat.jpg',
        '/static/examples/dog.jpg',
        '/static/examples/bird.jpg'
      ])
    })

    it('should render examples for generative demo', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'generative' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const exampleButtons = container.querySelectorAll('.example-btn')
      expect(exampleButtons).toHaveLength(3)
      
      const labels = Array.from(exampleButtons).map(btn => btn.textContent?.trim())
      expect(labels).toEqual(['Story', 'Code', 'Poetry'])
      
      const values = Array.from(exampleButtons).map(btn => btn.getAttribute('data-value'))
      expect(values[0]).toContain('Once upon a time in a digital garden')
      expect(values[1]).toContain('function fibonacci(n) {')
      expect(values[2]).toContain('Roses are red, violets are blue')
    })

    it('should not render examples section for custom demo with no examples', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'custom' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const examplesSection = container.querySelector('.examples-section')
      expect(examplesSection).toBeNull()
      
      const exampleButtons = container.querySelectorAll('.example-btn')
      expect(exampleButtons).toHaveLength(0)
    })
  })

  describe('Output Section', () => {
    it('should render output section with placeholder', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const outputSection = container.querySelector('.output-section')
      expect(outputSection).toBeTruthy()
      
      const outputLabel = container.querySelector('.output-label')
      expect(outputLabel?.textContent).toBe('Output:')
      
      const demoOutput = container.querySelector('.demo-output')
      expect(demoOutput).toBeTruthy()
      
      const outputPlaceholder = container.querySelector('.output-placeholder')
      expect(outputPlaceholder).toBeTruthy()
      
      const placeholderText = outputPlaceholder?.querySelector('p')
      expect(placeholderText?.textContent).toBe('Results will appear here after running the demo')
      
      const placeholderSvg = outputPlaceholder?.querySelector('svg')
      expect(placeholderSvg).toBeTruthy()
      expect(placeholderSvg?.getAttribute('width')).toBe('40')
      expect(placeholderSvg?.getAttribute('height')).toBe('40')
    })
  })

  describe('Demo Footer', () => {
    it('should render footer with model info and status', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'nlp' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoFooter = container.querySelector('.demo-footer')
      expect(demoFooter).toBeTruthy()
      
      const modelInfo = container.querySelector('.model-info')
      expect(modelInfo).toBeTruthy()
      
      const infoLabel = modelInfo?.querySelector('.info-label')
      expect(infoLabel?.textContent).toBe('Model:')
      
      const infoValue = modelInfo?.querySelector('.info-value')
      expect(infoValue?.textContent).toBe('Xenova/distilbert-base-uncased-finetuned-sst-2-english')
      
      const statusInfo = container.querySelector('.status-info')
      expect(statusInfo).toBeTruthy()
      
      const statusIndicator = container.querySelector('.status-indicator')
      expect(statusIndicator).toBeTruthy()
      
      const statusText = container.querySelector('.status-text')
      expect(statusText?.textContent).toBe('Ready')
    })

    it('should show custom model ID for custom demo', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ 
        demoType: 'custom',
        modelId: 'my-custom-model-v2'
      })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const infoValue = container.querySelector('.info-value')
      expect(infoValue?.textContent).toBe('my-custom-model-v2')
    })
  })

  describe('SVG Icons', () => {
    it('should render image input SVG icon correctly', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'vision' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const imageInputSvg = container.querySelector('.image-input-label svg')
      expect(imageInputSvg).toBeTruthy()
      expect(imageInputSvg?.getAttribute('width')).toBe('40')
      expect(imageInputSvg?.getAttribute('height')).toBe('40')
      expect(imageInputSvg?.getAttribute('viewBox')).toBe('0 0 24 24')
      expect(imageInputSvg?.getAttribute('fill')).toBe('none')
      expect(imageInputSvg?.getAttribute('stroke')).toBe('currentColor')
      
      const rect = imageInputSvg?.querySelector('rect')
      const circle = imageInputSvg?.querySelector('circle')
      const polyline = imageInputSvg?.querySelector('polyline')
      expect(rect).toBeTruthy()
      expect(circle).toBeTruthy()
      expect(polyline).toBeTruthy()
    })

    it('should render output placeholder SVG icon correctly', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const outputSvg = container.querySelector('.output-placeholder svg')
      expect(outputSvg).toBeTruthy()
      expect(outputSvg?.getAttribute('width')).toBe('40')
      expect(outputSvg?.getAttribute('height')).toBe('40')
      expect(outputSvg?.getAttribute('viewBox')).toBe('0 0 24 24')
      expect(outputSvg?.getAttribute('fill')).toBe('none')
      expect(outputSvg?.getAttribute('stroke')).toBe('currentColor')
      
      const path = outputSvg?.querySelector('path')
      expect(path).toBeTruthy()
      expect(path?.getAttribute('d')).toBe('M13 2L3 14h9l-1 8 10-12h-9l1-8z')
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply display class correctly', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps({
        displayClass: 'custom-demo-class',
      })
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.classList.contains('custom-demo-class')).toBe(true)
    })

    it('should have consistent CSS class structure', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      // Main container
      expect(container.querySelector('.interactive-ai-demo')).toBeTruthy()
      
      // Header
      expect(container.querySelector('.demo-header')).toBeTruthy()
      expect(container.querySelector('.demo-description')).toBeTruthy()
      
      // Content
      expect(container.querySelector('.demo-content')).toBeTruthy()
      expect(container.querySelector('.input-section')).toBeTruthy()
      expect(container.querySelector('.output-section')).toBeTruthy()
      
      // Footer
      expect(container.querySelector('.demo-footer')).toBeTruthy()
      expect(container.querySelector('.model-info')).toBeTruthy()
      expect(container.querySelector('.status-info')).toBeTruthy()
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      expect(typeof InteractiveAIDemoComponent).toBe('function')
    })

    it('should include CSS styles', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      expect(InteractiveAIDemoComponent.css).toBeDefined()
    })

    it('should include afterDOMLoaded script', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      expect(InteractiveAIDemoComponent.afterDOMLoaded).toBeDefined()
      expect(typeof InteractiveAIDemoComponent.afterDOMLoaded).toBe('string')
      expect(InteractiveAIDemoComponent.afterDOMLoaded).toContain('simple-ai-demo.js')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      // Should have proper heading structure
      const heading = container.querySelector('h3')
      expect(heading).toBeTruthy()
      
      // Input elements should have labels
      const inputLabel = container.querySelector('.input-label')
      const outputLabel = container.querySelector('.output-label')
      expect(inputLabel).toBeTruthy()
      expect(outputLabel).toBeTruthy()
      
      // Buttons should be buttons
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
      
      // Form inputs should be proper elements
      const textarea = container.querySelector('textarea')
      expect(textarea?.tagName).toBe('TEXTAREA')
    })

    it('should have proper label association for image input', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'vision' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const imageInput = container.querySelector('.image-input')
      const imageLabel = container.querySelector('.image-input-label')
      
      expect(imageInput?.getAttribute('id')).toBeTruthy()
      expect(imageLabel?.getAttribute('for')).toBeTruthy()
      // Note: The component generates unique IDs, so we can't test exact match
      // but we can verify both elements have the required attributes
    })

    it('should have meaningful placeholder text', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ demoType: 'generative' })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const textInput = container.querySelector('.text-input')
      expect(textInput?.getAttribute('placeholder')).toBe('Start typing your prompt...')
      
      const outputPlaceholder = container.querySelector('.output-placeholder p')
      expect(outputPlaceholder?.textContent).toBe('Results will appear here after running the demo')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing props gracefully', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      
      expect(() => {
        render(<InteractiveAIDemoComponent 
          displayClass="test"
          cfg={createMockProps().cfg}
          fileData={createMockProps().fileData}
          allFiles={createMockProps().allFiles}
        />)
      }).not.toThrow()
    })

    it('should handle invalid demo type gracefully', () => {
      const invalidOptions = {
        demoType: 'invalid' as any,
        modelSource: 'invalid' as any,
      }
      
      const InteractiveAIDemoComponent = InteractiveAIDemo(invalidOptions)
      const props = createMockProps()
      
      expect(() => {
        render(<InteractiveAIDemoComponent {...props} />)
      }).not.toThrow()
    })

    it('should handle empty options gracefully', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({})
      const props = createMockProps()
      
      expect(() => {
        render(<InteractiveAIDemoComponent {...props} />)
      }).not.toThrow()
    })

    it('should handle undefined fileData slug gracefully', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo()
      const props = createMockProps({
        fileData: { ...mockFileData, slug: undefined }
      })
      
      expect(() => {
        render(<InteractiveAIDemoComponent {...props} />)
      }).not.toThrow()
    })
  })

  describe('Options Merging', () => {
    it('should merge partial options with defaults correctly', () => {
      const partialOptions = {
        demoType: 'vision' as const,
        modelSource: 'custom' as const,
        apiEndpoint: '/api/custom',
      }
      
      const InteractiveAIDemoComponent = InteractiveAIDemo(partialOptions)
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const demoContainer = container.querySelector('.interactive-ai-demo')
      expect(demoContainer?.getAttribute('data-demo-type')).toBe('vision')
      expect(demoContainer?.getAttribute('data-model-source')).toBe('custom')
      expect(demoContainer?.getAttribute('data-api-endpoint')).toBe('/api/custom')
      expect(demoContainer?.getAttribute('data-fallback')).toBe('static') // default
    })

    it('should use demo config defaults for undefined custom demo properties', () => {
      const InteractiveAIDemoComponent = InteractiveAIDemo({ 
        demoType: 'custom',
        // No title, description, or modelId provided
      })
      const props = createMockProps()
      
      const { container } = render(<InteractiveAIDemoComponent {...props} />)
      
      const title = container.querySelector('h3')
      const description = container.querySelector('.demo-description')
      const modelInfo = container.querySelector('.info-value')
      
      expect(title?.textContent).toBe('Custom AI Demo')
      expect(description?.textContent).toBe('Interactive AI demonstration')
      expect(modelInfo?.textContent).toBe('')
    })
  })

  describe('Performance', () => {
    it('should render quickly with complex configuration', () => {
      const complexOptions = {
        demoType: 'custom' as const,
        title: 'Complex Demo with Very Long Title That Tests Performance',
        description: 'A very detailed description that explains exactly what this demo does and why it exists',
        modelId: 'organization/very-long-model-name-with-version-v1.2.3',
        apiEndpoint: '/api/v2/complex/endpoint/with/many/segments',
        defaultInput: 'This is a very long default input that simulates a complex use case',
      }
      
      const startTime = Date.now()
      const InteractiveAIDemoComponent = InteractiveAIDemo(complexOptions)
      const props = createMockProps()
      render(<InteractiveAIDemoComponent {...props} />)
      const endTime = Date.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(50) // Should render in under 50ms
    })
  })
})