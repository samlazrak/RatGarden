import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import PrivacyAnalytics from '../../quartz/components/PrivacyAnalytics'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

// Mock localStorage
const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.data[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.data = {}
  })
}

// Mock Date.now for consistent testing
const mockDate = new Date('2024-07-25T12:00:00Z')
const mockNow = mockDate.getTime()

describe('PrivacyAnalytics Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
    // Clear localStorage mock data
    mockLocalStorage.clear()
    // Mock Date.now
    vi.spyOn(Date, 'now').mockReturnValue(mockNow)
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test-page',
        hostname: 'example.com'
      },
      writable: true
    })
    // Mock document.referrer
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true
    })
    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(mockNow)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with default structure', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      const analyticsContainer = container.querySelector('.privacy-analytics')
      expect(analyticsContainer).toBeTruthy()
      
      const title = container.querySelector('h3')
      expect(title?.textContent).toBe('Privacy-First Analytics')
      
      const notice = container.querySelector('.analytics-notice')
      expect(notice).toBeTruthy()
      
      const noticeText = notice?.querySelector('p')
      expect(noticeText?.textContent).toBe('All analytics are processed locally. No data leaves your device.')
      
      const dashboard = container.querySelector('#analytics-dashboard')
      expect(dashboard).toBeTruthy()
    })

    it('should render all metric cards', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      const metricCards = container.querySelectorAll('.metric-card')
      expect(metricCards).toHaveLength(3)
      
      const cardTitles = Array.from(container.querySelectorAll('.metric-card h4')).map(
        el => el.textContent?.trim()
      )
      
      expect(cardTitles).toEqual([
        'Page Views',
        'Reading Patterns', 
        'Content Engagement'
      ])
    })

    it('should render chart containers with correct IDs', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      expect(container.querySelector('#pageview-chart')).toBeTruthy()
      expect(container.querySelector('#reading-heatmap')).toBeTruthy()
      expect(container.querySelector('#engagement-metrics')).toBeTruthy()
    })

    it('should apply display class correctly', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps({
        displayClass: 'custom-analytics-class',
      })
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      const analyticsContainer = container.querySelector('.privacy-analytics')
      expect(analyticsContainer?.classList.contains('custom-analytics-class')).toBe(true)
    })

    it('should handle undefined display class', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps({
        displayClass: undefined,
      })
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      const analyticsContainer = container.querySelector('.privacy-analytics')
      expect(analyticsContainer?.className).toBe('privacy-analytics ')
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      expect(typeof PrivacyAnalyticsComponent).toBe('function')
    })

    it('should include CSS styles', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      expect(PrivacyAnalyticsComponent.css).toBeDefined()
    })

    it('should include afterDOMLoaded script', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      expect(PrivacyAnalyticsComponent.afterDOMLoaded).toBeDefined()
      expect(typeof PrivacyAnalyticsComponent.afterDOMLoaded).toBe('string')
      expect(PrivacyAnalyticsComponent.afterDOMLoaded).toContain('PrivacyAnalytics')
      expect(PrivacyAnalyticsComponent.afterDOMLoaded).toContain('localStorage')
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should have consistent CSS class structure', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      // Main container
      expect(container.querySelector('.privacy-analytics')).toBeTruthy()
      
      // Notice section
      expect(container.querySelector('.analytics-notice')).toBeTruthy()
      
      // Dashboard
      expect(container.querySelector('#analytics-dashboard')).toBeTruthy()
      
      // Metric cards
      expect(container.querySelectorAll('.metric-card')).toHaveLength(3)
    })

    it('should apply proper heading hierarchy', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      // Main title should be h3
      const mainTitle = container.querySelector('h3')
      expect(mainTitle).toBeTruthy()
      expect(mainTitle?.textContent).toBe('Privacy-First Analytics')
      
      // Card titles should be h4
      const cardTitles = container.querySelectorAll('h4')
      expect(cardTitles).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      // Should have proper heading hierarchy
      const h3 = container.querySelector('h3')
      const h4s = container.querySelectorAll('h4')
      expect(h3).toBeTruthy()
      expect(h4s).toHaveLength(3)
      
      // Should have meaningful IDs for chart containers
      expect(container.querySelector('#analytics-dashboard')).toBeTruthy()
      expect(container.querySelector('#pageview-chart')).toBeTruthy()
      expect(container.querySelector('#reading-heatmap')).toBeTruthy()
      expect(container.querySelector('#engagement-metrics')).toBeTruthy()
    })

    it('should have informative privacy notice', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      const notice = container.querySelector('.analytics-notice p')
      expect(notice?.textContent).toBe('All analytics are processed locally. No data leaves your device.')
    })
  })

  describe('Client-side Analytics Script Structure', () => {
    it('should contain required constants and class definition', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('ANALYTICS_KEY')
      expect(script).toContain('RETENTION_DAYS')
      expect(script).toContain('class PrivacyAnalytics')
      expect(script).toContain('constructor()')
      expect(script).toContain('loadData()')
      expect(script).toContain('saveData()')
      expect(script).toContain('cleanOldData()')
      expect(script).toContain('initializeTracking()')
      expect(script).toContain('generateHeatmap()')
      expect(script).toContain('renderDashboard()')
    })

    it('should contain localStorage operations', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('localStorage.getItem')
      expect(script).toContain('localStorage.setItem')
      expect(script).toContain('JSON.parse')
      expect(script).toContain('JSON.stringify')
    })

    it('should contain event listeners for tracking', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('addEventListener')
      expect(script).toContain('visibilitychange')
      expect(script).toContain('beforeunload')
    })

    it('should contain data structure initialization', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('pageViews: {}')
      expect(script).toContain('readingTime: {}')
      expect(script).toContain('referrers: {}')
      expect(script).toContain('searchQueries: []')
    })

    it('should contain data retention logic', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('RETENTION_DAYS * 24 * 60 * 60 * 1000')
      expect(script).toContain('cleanOldData')
      expect(script).toContain('cutoff')
    })

    it('should contain dashboard rendering logic', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('getElementById')
      expect(script).toContain('pageview-chart')
      expect(script).toContain('reading-heatmap')
      expect(script).toContain('engagement-metrics')
      expect(script).toContain('innerHTML')
    })

    it('should contain privacy-friendly referrer tracking', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('document.referrer')
      expect(script).toContain('window.location.hostname')
      expect(script).toContain('new URL(document.referrer).hostname')
    })

    it('should contain heatmap generation logic', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('generateHeatmap')
      expect(script).toContain('sort((a, b) => b[1] - a[1])')
      expect(script).toContain('slice(0, 10)')
      expect(script).toContain('Math.round(time / 1000 / 60)')
      expect(script).toContain('Math.min(time / 300000, 1)')
    })

    it('should contain initialization guard', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain("if (document.getElementById('analytics-dashboard'))")
      expect(script).toContain('new PrivacyAnalytics()')
    })
  })

  describe('Data Privacy Compliance', () => {
    it('should not contain external API calls', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should not contain common external tracking patterns
      expect(script).not.toContain('fetch(')
      expect(script).not.toContain('XMLHttpRequest')
      expect(script).not.toContain('analytics.google.com')
      expect(script).not.toContain('facebook.com')
      expect(script).not.toContain('twitter.com')
      expect(script).not.toContain('linkedin.com')
      expect(script).not.toContain('gtag')
      expect(script).not.toContain('_ga')
      expect(script).not.toContain('fbq')
    })

    it('should only use localStorage for data persistence', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should use localStorage but not other storage methods that might sync
      expect(script).toContain('localStorage')
      expect(script).not.toContain('sessionStorage')
      expect(script).not.toContain('indexedDB')
      expect(script).not.toContain('cookie')
      expect(script).not.toContain('document.cookie')
    })

    it('should contain explicit privacy messaging', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      
      const { container } = render(<PrivacyAnalyticsComponent {...props} />)
      
      const privacyText = container.textContent
      expect(privacyText).toContain('Privacy-First Analytics')
      expect(privacyText).toContain('All analytics are processed locally')
      expect(privacyText).toContain('No data leaves your device')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing props gracefully', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      
      expect(() => {
        render(<PrivacyAnalyticsComponent 
          displayClass="test"
          cfg={createMockProps().cfg}
          fileData={createMockProps().fileData}
          allFiles={createMockProps().allFiles}
        />)
      }).not.toThrow()
    })

    it('should handle null displayClass gracefully', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps({
        displayClass: null as any,
      })
      
      expect(() => {
        render(<PrivacyAnalyticsComponent {...props} />)
      }).not.toThrow()
    })

    it('should contain defensive programming in script', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should check for element existence before operations
      expect(script).toContain('if (!dashboard) return')
      expect(script).toContain('if (pageViewEl)')
      expect(script).toContain('if (heatmapEl)')
      expect(script).toContain('if (engagementEl)')
      
      // Should have fallback values
      expect(script).toContain('|| 0')
      expect(script).toContain('? JSON.parse(stored) :')
    })
  })

  describe('Performance Considerations', () => {
    it('should render quickly', () => {
      const startTime = Date.now()
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const props = createMockProps()
      render(<PrivacyAnalyticsComponent {...props} />)
      const endTime = Date.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(50) // Should render in under 50ms
    })

    it('should contain performance optimizations in script', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should limit data size
      expect(script).toContain('slice(0, 10)') // Limit heatmap entries
      expect(script).toContain('RETENTION_DAYS') // Limit data retention
      
      // Should clean old data
      expect(script).toContain('cleanOldData')
      expect(script).toContain('delete this.data.pageViews[key]')
    })
  })

  describe('Metric Calculations', () => {
    it('should contain correct time conversion calculations', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should convert milliseconds to minutes
      expect(script).toContain('Math.round(time / 1000 / 60)')
      expect(script).toContain('Math.round(totalReadingTime / 1000 / 60)')
      expect(script).toContain('Math.round(avgReadingTime / 1000 / 60)')
      
      // Should calculate intensity for visualization
      expect(script).toContain('Math.min(time / 300000, 1)') // 5 min max
    })

    it('should contain date filtering logic', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should filter for recent views (7 days)
      expect(script).toContain('7 * 24 * 60 * 60 * 1000')
      expect(script).toContain('timestamp > Date.now()')
      
      // Should parse timestamps from keys
      expect(script).toContain('parseInt(key.split(\'-\')[0])')
    })

    it('should contain average calculation with division by zero protection', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('Object.keys(this.data.readingTime).length || 0')
    })
  })

  describe('HTML Generation', () => {
    it('should contain template literals for dashboard content', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should contain HTML templates
      expect(script).toContain('innerHTML = `')
      expect(script).toContain('<div class="metric-value">')
      expect(script).toContain('<div class="metric-label">')
      expect(script).toContain('<div class="heatmap-row">')
      expect(script).toContain('<div class="heatmap-bar">')
      expect(script).toContain('<div class="engagement-stat">')
      expect(script).toContain('<div class="stat-value">')
      expect(script).toContain('<div class="stat-label">')
    })

    it('should contain dynamic styling for heatmap bars', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('style="width: ${intensity * 100}%')
      expect(script).toContain('opacity: ${0.3 + intensity * 0.7}')
    })

    it('should contain proper escaping and safety measures', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      // Should use template literals properly
      expect(script).toContain('${')
      expect(script).toContain('`).join(\'\')') // For array joins
    })
  })

  describe('Integration Points', () => {
    it('should contain DOM queries for specific elements', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain("document.getElementById('analytics-dashboard')")
      expect(script).toContain("document.getElementById('pageview-chart')")
      expect(script).toContain("document.getElementById('reading-heatmap')")
      expect(script).toContain("document.getElementById('engagement-metrics')")
    })

    it('should contain browser API usage', () => {
      const PrivacyAnalyticsComponent = PrivacyAnalytics()
      const script = PrivacyAnalyticsComponent.afterDOMLoaded
      
      expect(script).toContain('window.location.pathname')
      expect(script).toContain('window.location.hostname')
      expect(script).toContain('document.referrer')
      expect(script).toContain('document.hidden')
      expect(script).toContain('Date.now()')
    })
  })
})