import { beforeEach, afterEach, vi } from 'vitest'

/**
 * Mock data for testing AI components
 */
export const mockFileData = {
  slug: 'test-article',
  title: 'Test Article',
  dates: {
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-02'),
  },
  frontmatter: {
    title: 'Test Article',
    tags: ['test', 'example'],
    description: 'A test article for testing AI components',
  },
  toc: [],
  semanticLinks: [],
}

export const mockAllFiles = [
  {
    ...mockFileData,
    slug: 'article-1',
    title: 'First Article',
    frontmatter: {
      title: 'First Article',
      tags: ['ai', 'machine-learning'],
      description: 'An article about AI and machine learning',
    },
  },
  {
    ...mockFileData,
    slug: 'article-2', 
    title: 'Second Article',
    frontmatter: {
      title: 'Second Article',
      tags: ['programming', 'typescript'],
      description: 'An article about programming in TypeScript',
    },
  },
  {
    ...mockFileData,
    slug: 'article-3',
    title: 'Third Article', 
    frontmatter: {
      title: 'Third Article',
      tags: ['web-development', 'react'],
      description: 'An article about React web development',
    },
  },
]

export const mockCfg = {
  locale: 'en-US' as const,
  baseUrl: 'test.example.com',
  theme: {
    colors: {
      lightMode: {
        light: '#ffffff',
        dark: '#000000',
      },
      darkMode: {
        light: '#000000',
        dark: '#ffffff',
      },
    },
  },
}

/**
 * Mock component props for testing
 */
export const createMockProps = (overrides: any = {}) => ({
  displayClass: 'test-class',
  cfg: mockCfg,
  fileData: mockFileData,
  allFiles: mockAllFiles,
  ...overrides,
})

/**
 * Mock DOM environment setup
 */
export const setupMockDOM = () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    
    // Mock window.fetch for API calls
    global.fetch = vi.fn()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.localStorage = localStorageMock as any
    
    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.sessionStorage = sessionStorageMock as any
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
}

/**
 * Mock search results for testing
 */
export const mockSearchResults = [
  {
    id: 1,
    slug: 'article-1',
    title: 'First Article',
    content: 'This is the content of the first article about AI and machine learning.',
    tags: ['ai', 'machine-learning'],
    score: 0.95,
    explanation: 'High relevance due to keyword match and semantic similarity',
  },
  {
    id: 2,
    slug: 'article-2',
    title: 'Second Article', 
    content: 'This is the content of the second article about programming.',
    tags: ['programming', 'typescript'],
    score: 0.78,
    explanation: 'Moderate relevance based on semantic similarity',
  },
]

/**
 * Mock embedding data for testing
 */
export const mockEmbeddingData = {
  embeddings: {
    'article-1': new Array(384).fill(0).map(() => Math.random()),
    'article-2': new Array(384).fill(0).map(() => Math.random()),
    'article-3': new Array(384).fill(0).map(() => Math.random()),
  },
  model: 'minilm',
  dimensions: 384,
}

/**
 * Utility to create mock embedding vectors
 */
export const createMockEmbedding = (dimensions: number = 384): number[] => {
  return new Array(dimensions).fill(0).map(() => Math.random() * 2 - 1)
}

/**
 * Mock recommendation data
 */
export const mockRecommendations = [
  {
    slug: 'recommended-1',
    title: 'Recommended Article 1',
    description: 'A recommended article based on your reading history',
    tags: ['ai', 'recommendation'],
    score: 0.89,
    explanation: 'Recommended because you often read about AI topics',
  },
  {
    slug: 'recommended-2',
    title: 'Recommended Article 2',
    description: 'Another recommended article based on semantic similarity',
    tags: ['machine-learning', 'data-science'],
    score: 0.76,
    explanation: 'Similar to articles you have read recently',
  },
]

/**
 * Mock AI writing suggestions
 */
export const mockWritingSuggestions = [
  {
    type: 'grammar',
    text: 'Consider using "their" instead of "there"',
    position: { start: 10, end: 15 },
    confidence: 0.92,
  },
  {
    type: 'style',
    text: 'This sentence could be more concise',
    position: { start: 25, end: 40 },
    confidence: 0.78,
  },
]

/**
 * Utility to wait for async operations in tests
 */
export const waitFor = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Utility to trigger DOM events in tests
 */
export const fireEvent = {
  click: (element: Element) => {
    const event = new MouseEvent('click', { bubbles: true })
    element.dispatchEvent(event)
  },
  input: (element: Element, value: string) => {
    if (element instanceof HTMLInputElement) {
      element.value = value
      const event = new Event('input', { bubbles: true })
      element.dispatchEvent(event)
    }
  },
  keydown: (element: Element, key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true })
    element.dispatchEvent(event)
  },
}

/**
 * Utility to check if element is visible
 */
export const isVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

/**
 * Mock error responses for testing error handling
 */
export const mockErrorResponses = {
  networkError: new Error('Network error'),
  notFound: new Response('Not found', { status: 404 }),
  serverError: new Response('Server error', { status: 500 }),
  invalidJson: new Response('Invalid JSON', { status: 200 }),
}

/**
 * Performance testing utilities
 */
export const performanceTest = {
  measure: async (fn: Function, iterations: number = 100): Promise<number> => {
    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      await fn()
    }
    const end = performance.now()
    return end - start
  },
  
  expectFastExecution: (duration: number, maxMs: number = 100) => {
    if (duration > maxMs) {
      throw new Error(`Expected execution to be under ${maxMs}ms, but took ${duration.toFixed(2)}ms`)
    }
  }
}