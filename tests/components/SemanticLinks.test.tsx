import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import SemanticLinks from '../../quartz/components/SemanticLinks'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

// Mock semantic link data
const mockSemanticLinks = [
  {
    target: 'blog/test-post-1',
    strength: 0.85,
    confidence: 0.92,
    type: 'semantic',
    explanation: 'Both articles discuss artificial intelligence and machine learning concepts',
    sentimentAlignment: {
      emotionMatch: true,
      compatibility: 0.78
    }
  },
  {
    target: 'blog/test-post-2', 
    strength: 0.65,
    confidence: 0.71,
    type: 'tag-based',
    explanation: 'Articles share common tags: AI, technology, programming',
    sentimentAlignment: {
      emotionMatch: false,
      compatibility: 0.42
    }
  },
  {
    target: 'blog/test-post-3',
    strength: 0.45,
    confidence: 0.58,
    type: 'direct',
    explanation: 'Directly linked from this article',
    sentimentAlignment: {
      emotionMatch: true,
      compatibility: 0.85
    }
  },
  {
    target: 'blog/test-post-4',
    strength: 0.25, // Below default threshold
    confidence: 0.33,
    type: 'semantic',
    explanation: 'Weak connection based on similar keywords'
  }
]

const mockAllFiles = [
  {
    ...mockFileData,
    slug: 'blog/test-post-1',
    frontmatter: { title: 'AI in Modern Development' },
    semanticEmbedding: {
      sentiment: { emotion: 'positive', polarity: 0.6 }
    }
  },
  {
    ...mockFileData,
    slug: 'blog/test-post-2',
    frontmatter: { title: 'Programming Best Practices' },
    semanticEmbedding: {
      sentiment: { emotion: 'neutral', polarity: 0.1 }
    }
  },
  {
    ...mockFileData,
    slug: 'blog/test-post-3',
    frontmatter: { title: 'Technology Trends 2024' },
    semanticEmbedding: {
      sentiment: { emotion: 'positive', polarity: 0.4 }
    }
  },
  {
    ...mockFileData,
    slug: 'blog/test-post-4',
    frontmatter: { title: 'Getting Started with Machine Learning' },
    semanticEmbedding: {
      sentiment: { emotion: 'negative', polarity: -0.3 }
    }
  }
]

describe('SemanticLinks Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with default options', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const semanticLinksContainer = container.querySelector('.semantic-links')
      expect(semanticLinksContainer).toBeTruthy()
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Semantic Links')
      
      const linkItems = container.querySelectorAll('.semantic-link-item')
      expect(linkItems).toHaveLength(3) // Only links above minStrength (0.3)
      
      const footer = container.querySelector('.semantic-links-footer')
      expect(footer).toBeTruthy()
      
      const note = footer?.querySelector('.semantic-links-note')
      expect(note?.textContent).toBe('Links suggested by AI based on content similarity and sentiment analysis')
    })

    it('should render with custom options', () => {
      const customOptions = {
        title: 'Related Content',
        maxSuggestions: 2,
        minStrength: 0.5,
        showStrength: false,
        showConfidence: true,
        showExplanation: false,
        showSentiment: false,
        showSentimentAlignment: false,
      }
      
      const SemanticLinksComponent = SemanticLinks(customOptions)
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Related Content')
      
      const linkItems = container.querySelectorAll('.semantic-link-item')
      expect(linkItems).toHaveLength(2) // maxSuggestions: 2, minStrength: 0.5
      
      // Check custom options are applied
      expect(container.querySelector('.semantic-strength')).toBeNull() // showStrength: false
      expect(container.querySelector('.semantic-confidence')).toBeTruthy() // showConfidence: true
      expect(container.querySelector('.semantic-explanation')).toBeNull() // showExplanation: false
      expect(container.querySelector('.semantic-sentiment')).toBeNull() // showSentiment: false
      expect(container.querySelector('.sentiment-alignment')).toBeNull() // showSentimentAlignment: false
    })

    it('should return null when no semantic links exist', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: undefined
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should return null when no links meet minimum strength threshold', () => {
      const weakLinks = [
        { target: 'test', strength: 0.1, type: 'semantic' },
        { target: 'test2', strength: 0.2, type: 'semantic' }
      ]
      
      const SemanticLinksComponent = SemanticLinks({ minStrength: 0.5 })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: weakLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Link Sorting and Filtering', () => {
    it('should sort links by strength in descending order', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkTitles = Array.from(container.querySelectorAll('.semantic-link-title')).map(
        el => el.textContent?.trim()
      )
      
      // Should be sorted by strength: 0.85, 0.65, 0.45 (0.25 filtered out)
      expect(linkTitles).toEqual([
        'AI in Modern Development',    // strength: 0.85
        'Programming Best Practices',  // strength: 0.65
        'Technology Trends 2024'       // strength: 0.45
      ])
    })

    it('should respect maxSuggestions limit', () => {
      const SemanticLinksComponent = SemanticLinks({ maxSuggestions: 2 })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkItems = container.querySelectorAll('.semantic-link-item')
      expect(linkItems).toHaveLength(2)
      
      const linkTitles = Array.from(container.querySelectorAll('.semantic-link-title')).map(
        el => el.textContent?.trim()
      )
      
      expect(linkTitles).toEqual([
        'AI in Modern Development',    // strength: 0.85
        'Programming Best Practices'   // strength: 0.65
      ])
    })

    it('should filter by minimum strength threshold', () => {
      const SemanticLinksComponent = SemanticLinks({ minStrength: 0.6 })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkItems = container.querySelectorAll('.semantic-link-item')
      expect(linkItems).toHaveLength(2) // Only 0.85 and 0.65 strength links
    })
  })

  describe('Strength Classification', () => {
    it('should apply correct strength classes and labels', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkItems = container.querySelectorAll('.semantic-link-item')
      
      // First link (0.85 strength) - strong
      expect(linkItems[0]?.classList.contains('semantic-strong')).toBe(true)
      const strongLabel = linkItems[0]?.querySelector('.semantic-strength-label')
      expect(strongLabel?.textContent).toBe('Strong')
      expect(strongLabel?.classList.contains('semantic-strong')).toBe(true)
      
      // Second link (0.65 strength) - medium
      expect(linkItems[1]?.classList.contains('semantic-medium')).toBe(true)
      const mediumLabel = linkItems[1]?.querySelector('.semantic-strength-label')
      expect(mediumLabel?.textContent).toBe('Medium')
      expect(mediumLabel?.classList.contains('semantic-medium')).toBe(true)
      
      // Third link (0.45 strength) - weak
      expect(linkItems[2]?.classList.contains('semantic-weak')).toBe(true)
      const weakLabel = linkItems[2]?.querySelector('.semantic-strength-label')
      expect(weakLabel?.textContent).toBe('Weak')
      expect(weakLabel?.classList.contains('semantic-weak')).toBe(true)
    })

    it('should format strength percentages correctly', () => {
      const SemanticLinksComponent = SemanticLinks({ showStrength: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const strengthIndicators = container.querySelectorAll('.semantic-strength')
      
      expect(strengthIndicators[0]?.textContent).toBe('85%') // 0.85 * 100
      expect(strengthIndicators[1]?.textContent).toBe('65%') // 0.65 * 100
      expect(strengthIndicators[2]?.textContent).toBe('45%') // 0.45 * 100
    })
  })

  describe('Link Types and Metadata', () => {
    it('should display correct link type labels', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const typeLabels = Array.from(container.querySelectorAll('.semantic-type')).map(
        el => el.textContent?.trim()
      )
      
      expect(typeLabels).toEqual([
        'AI Suggested',    // type: 'semantic'
        'Tag Related',     // type: 'tag-based'
        'Direct Link'      // type: 'direct'
      ])
    })

    it('should apply correct type classes', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const typeElements = container.querySelectorAll('.semantic-type')
      
      expect(typeElements[0]?.classList.contains('semantic-type-semantic')).toBe(true)
      expect(typeElements[1]?.classList.contains('semantic-type-tag-based')).toBe(true)
      expect(typeElements[2]?.classList.contains('semantic-type-direct')).toBe(true)
    })

    it('should show confidence when enabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showConfidence: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const confidenceIndicators = container.querySelectorAll('.semantic-confidence')
      
      expect(confidenceIndicators[0]?.textContent).toBe('92% confidence')
      expect(confidenceIndicators[1]?.textContent).toBe('71% confidence')
      expect(confidenceIndicators[2]?.textContent).toBe('58% confidence')
    })

    it('should not show confidence when disabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showConfidence: false })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const confidenceIndicators = container.querySelectorAll('.semantic-confidence')
      expect(confidenceIndicators).toHaveLength(0)
    })
  })

  describe('Sentiment Analysis', () => {
    it('should display sentiment indicators when enabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showSentiment: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks,
          semanticEmbedding: {
            sentiment: { emotion: 'positive', polarity: 0.5 }
          }
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const sentimentSections = container.querySelectorAll('.semantic-sentiment')
      expect(sentimentSections.length).toBeGreaterThan(0)
      
      // Check for sentiment emojis
      const sentimentEmojis = container.querySelectorAll('.sentiment-emoji')
      expect(sentimentEmojis.length).toBeGreaterThan(0)
      
      // Check for sentiment labels
      const sentimentLabels = container.querySelectorAll('.sentiment-label')
      expect(sentimentLabels.length).toBeGreaterThan(0)
    })

    it('should use correct sentiment emojis and colors', () => {
      const SemanticLinksComponent = SemanticLinks({ showSentiment: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks,
          semanticEmbedding: {
            sentiment: { emotion: 'positive', polarity: 0.5 }
          }
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      // Check for different sentiment emojis based on mock data
      const sentimentEmojis = Array.from(container.querySelectorAll('.sentiment-emoji')).map(
        el => el.textContent?.trim()
      )
      
      expect(sentimentEmojis).toContain('😊') // positive
      expect(sentimentEmojis).toContain('😐') // neutral
      
      // Check for sentiment color classes
      const sentimentIndicators = container.querySelectorAll('.sentiment-indicator')
      const hasPositiveClass = Array.from(sentimentIndicators).some(el => 
        el.classList.contains('sentiment-positive')
      )
      const hasNeutralClass = Array.from(sentimentIndicators).some(el => 
        el.classList.contains('sentiment-neutral')
      )
      
      expect(hasPositiveClass).toBe(true)
      expect(hasNeutralClass).toBe(true)
    })

    it('should not display sentiment when disabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showSentiment: false })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks,
          semanticEmbedding: {
            sentiment: { emotion: 'positive', polarity: 0.5 }
          }
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const sentimentSections = container.querySelectorAll('.semantic-sentiment')
      expect(sentimentSections).toHaveLength(0)
    })
  })

  describe('Sentiment Alignment', () => {
    it('should display sentiment alignment indicators when enabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showSentimentAlignment: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const alignmentIndicators = container.querySelectorAll('.sentiment-alignment')
      expect(alignmentIndicators).toHaveLength(3) // All links have sentimentAlignment
      
      // Check for different alignment emojis
      const alignmentEmojis = Array.from(alignmentIndicators).map(el => el.textContent?.trim())
      
      expect(alignmentEmojis[0]).toBe('👍') // emotionMatch: true, compatibility: 0.78
      expect(alignmentEmojis[1]).toBe('🔄') // emotionMatch: false, compatibility: 0.42
      expect(alignmentEmojis[2]).toBe('🤝') // emotionMatch: true, compatibility: 0.85
    })

    it('should include compatibility percentage in title attribute', () => {
      const SemanticLinksComponent = SemanticLinks({ showSentimentAlignment: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const alignmentIndicators = container.querySelectorAll('.sentiment-alignment')
      
      expect(alignmentIndicators[0]?.getAttribute('title')).toBe('Sentiment compatibility: 78%')
      expect(alignmentIndicators[1]?.getAttribute('title')).toBe('Sentiment compatibility: 42%')
      expect(alignmentIndicators[2]?.getAttribute('title')).toBe('Sentiment compatibility: 85%')
    })

    it('should not display alignment when disabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showSentimentAlignment: false })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const alignmentIndicators = container.querySelectorAll('.sentiment-alignment')
      expect(alignmentIndicators).toHaveLength(0)
    })
  })

  describe('Explanations', () => {
    it('should display explanations when enabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showExplanation: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const explanations = container.querySelectorAll('.semantic-explanation')
      expect(explanations).toHaveLength(3)
      
      const explanationTexts = Array.from(explanations).map(el => el.textContent?.trim())
      
      expect(explanationTexts).toEqual([
        'Both articles discuss artificial intelligence and machine learning concepts',
        'Articles share common tags: AI, technology, programming',
        'Directly linked from this article'
      ])
    })

    it('should not display explanations when disabled', () => {
      const SemanticLinksComponent = SemanticLinks({ showExplanation: false })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const explanations = container.querySelectorAll('.semantic-explanation')
      expect(explanations).toHaveLength(0)
    })

    it('should not display explanation section when link has no explanation', () => {
      const linksWithoutExplanation = [
        {
          target: 'blog/test-post-1',
          strength: 0.85,
          type: 'semantic'
          // No explanation property
        }
      ]
      
      const SemanticLinksComponent = SemanticLinks({ showExplanation: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: linksWithoutExplanation
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const explanations = container.querySelectorAll('.semantic-explanation')
      expect(explanations).toHaveLength(0)
    })
  })

  describe('Link Titles and URLs', () => {
    it('should use frontmatter title when available', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkTitles = Array.from(container.querySelectorAll('.semantic-link-title')).map(
        el => el.textContent?.trim()
      )
      
      expect(linkTitles).toEqual([
        'AI in Modern Development',
        'Programming Best Practices',
        'Technology Trends 2024'
      ])
    })

    it('should fallback to slug when no frontmatter title', () => {
      const filesWithoutTitles = mockAllFiles.map(file => ({
        ...file,
        frontmatter: { ...file.frontmatter, title: undefined }
      }))
      
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks.slice(0, 1) // Just first link
        },
        allFiles: filesWithoutTitles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkTitle = container.querySelector('.semantic-link-title')
      expect(linkTitle?.textContent).toBe('blog/test-post-1')
    })

    it('should set correct href attributes for links', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          slug: 'current-page'
        },
        allFiles: mockAllFiles
      })
      
      const mockLinksForUrl = [
        { target: 'blog/test-post-1', strength: 0.85, type: 'semantic' }
      ]
      
      const propsWithMockLinks = {
        ...props,
        fileData: {
          ...props.fileData,
          semanticLinks: mockLinksForUrl
        }
      }
      
      const { container } = render(<SemanticLinksComponent {...propsWithMockLinks} />)
      
      const linkElement = container.querySelector('.semantic-link-title')
      expect(linkElement?.getAttribute('href')).toBeTruthy()
    })

    it('should set data-no-popover attribute correctly', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const linkElements = container.querySelectorAll('.semantic-link-title')
      linkElements.forEach(link => {
        expect(link.getAttribute('data-no-popover')).toBe('false')
      })
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply display class correctly', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        displayClass: 'custom-semantic-class',
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const semanticLinksContainer = container.querySelector('.semantic-links')
      expect(semanticLinksContainer?.classList.contains('custom-semantic-class')).toBe(true)
    })

    it('should have consistent CSS class structure', () => {
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      // Main container
      expect(container.querySelector('.semantic-links')).toBeTruthy()
      expect(container.querySelector('.semantic-links-container')).toBeTruthy()
      expect(container.querySelector('.semantic-links-footer')).toBeTruthy()
      
      // Link items
      expect(container.querySelectorAll('.semantic-link-item')).toHaveLength(3)
      expect(container.querySelectorAll('.semantic-link-header')).toHaveLength(3)
      expect(container.querySelectorAll('.semantic-link-meta')).toHaveLength(3)
      expect(container.querySelectorAll('.semantic-link-indicators')).toHaveLength(3)
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const SemanticLinksComponent = SemanticLinks()
      expect(typeof SemanticLinksComponent).toBe('function')
      expect(SemanticLinksComponent.displayName).toBe('SemanticLinks')
    })

    it('should include CSS styles', () => {
      const SemanticLinksComponent = SemanticLinks()
      expect(SemanticLinksComponent.css).toBeDefined()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing target files gracefully', () => {
      const linksWithMissingTargets = [
        {
          target: 'nonexistent-file',
          strength: 0.85,
          type: 'semantic',
          explanation: 'Link to nonexistent file'
        }
      ]
      
      const SemanticLinksComponent = SemanticLinks()
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: linksWithMissingTargets
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      // Should still render the link but use slug as title
      const linkTitle = container.querySelector('.semantic-link-title')
      expect(linkTitle?.textContent).toBe('nonexistent-file')
    })

    it('should handle missing sentiment data gracefully', () => {
      const filesWithoutSentiment = mockAllFiles.map(file => ({
        ...file,
        semanticEmbedding: undefined
      }))
      
      const SemanticLinksComponent = SemanticLinks({ showSentiment: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks,
          semanticEmbedding: undefined
        },
        allFiles: filesWithoutSentiment
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      // Should not render sentiment sections when no sentiment data
      const sentimentSections = container.querySelectorAll('.semantic-sentiment')
      expect(sentimentSections).toHaveLength(0)
    })

    it('should handle missing confidence gracefully', () => {
      const linksWithoutConfidence = mockSemanticLinks.map(link => ({
        ...link,
        confidence: undefined
      }))
      
      const SemanticLinksComponent = SemanticLinks({ showConfidence: true })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: linksWithoutConfidence
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      // Should not render confidence indicators when confidence is missing
      const confidenceIndicators = container.querySelectorAll('.semantic-confidence')
      expect(confidenceIndicators).toHaveLength(0)
    })

    it('should handle missing props gracefully', () => {
      const SemanticLinksComponent = SemanticLinks()
      
      expect(() => {
        render(<SemanticLinksComponent 
          displayClass="test"
          cfg={createMockProps().cfg}
          fileData={{
            ...createMockProps().fileData,
            semanticLinks: mockSemanticLinks
          }}
          allFiles={mockAllFiles}
        />)
      }).not.toThrow()
    })
  })

  describe('Options Merging', () => {
    it('should merge partial options with defaults correctly', () => {
      const partialOptions = {
        title: 'Custom Title',
        maxSuggestions: 1,
        showConfidence: true,
      }
      
      const SemanticLinksComponent = SemanticLinks(partialOptions)
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: mockSemanticLinks
        },
        allFiles: mockAllFiles
      })
      
      const { container } = render(<SemanticLinksComponent {...props} />)
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Custom Title')
      
      const linkItems = container.querySelectorAll('.semantic-link-item')
      expect(linkItems).toHaveLength(1) // maxSuggestions: 1
      
      const confidenceIndicator = container.querySelector('.semantic-confidence')
      expect(confidenceIndicator).toBeTruthy() // showConfidence: true
      
      // Check that defaults are still applied
      const strengthIndicator = container.querySelector('.semantic-strength')
      expect(strengthIndicator).toBeTruthy() // showStrength: true (default)
      
      const explanation = container.querySelector('.semantic-explanation')
      expect(explanation).toBeTruthy() // showExplanation: true (default)
    })
  })

  describe('Performance', () => {
    it('should handle large numbers of semantic links efficiently', () => {
      const largeSemanticLinks = Array.from({ length: 100 }, (_, i) => ({
        target: `blog/post-${i}`,
        strength: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
        type: 'semantic',
        confidence: Math.random(),
        explanation: `Connection explanation ${i}`
      }))
      
      const startTime = Date.now()
      const SemanticLinksComponent = SemanticLinks({ maxSuggestions: 10 })
      const props = createMockProps({
        fileData: {
          ...mockFileData,
          semanticLinks: largeSemanticLinks
        },
        allFiles: mockAllFiles
      })
      render(<SemanticLinksComponent {...props} />)
      const endTime = Date.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(100) // Should render in under 100ms
    })
  })
})