import { vi } from 'vitest'
import { createMockEmbedding } from '../utils/ai-test-utils'

/**
 * Mock TensorFlow.js Universal Sentence Encoder
 */
export const mockUniversalSentenceEncoder = {
  load: vi.fn().mockResolvedValue({
    embed: vi.fn().mockImplementation((texts: string[]) => {
      // Return mock tensor-like object
      const embeddings = texts.map(() => createMockEmbedding(512))
      return Promise.resolve({
        arraySync: () => embeddings,
        dispose: vi.fn(),
        shape: [texts.length, 512],
      })
    }),
    dispose: vi.fn(),
  }),
}

/**
 * Mock TensorFlow.js core
 */
export const mockTensorFlow = {
  tensor: vi.fn().mockImplementation((data: number[][]) => ({
    arraySync: () => data,
    dispose: vi.fn(),
    shape: [data.length, data[0]?.length || 0],
  })),
  
  tensor2d: vi.fn().mockImplementation((data: number[][]) => ({
    arraySync: () => data,
    dispose: vi.fn(),
    shape: [data.length, data[0]?.length || 0],
  })),
  
  matMul: vi.fn().mockImplementation((a: any, b: any) => ({
    arraySync: () => [[0.5, 0.7, 0.3]],
    dispose: vi.fn(),
    shape: [1, 3],
  })),
  
  dot: vi.fn().mockImplementation(() => ({
    arraySync: () => 0.75,
    dispose: vi.fn(),
  })),
  
  norm: vi.fn().mockImplementation(() => ({
    arraySync: () => 1.0,
    dispose: vi.fn(),
  })),
  
  div: vi.fn().mockImplementation((a: any, b: any) => ({
    arraySync: () => a.arraySync(),
    dispose: vi.fn(),
  })),
  
  ready: vi.fn().mockResolvedValue(true),
  
  dispose: vi.fn(),
  
  memory: vi.fn().mockReturnValue({
    numTensors: 0,
    numDataBuffers: 0,
    numBytes: 0,
  }),
}

/**
 * Mock embedding models
 */
export const mockEmbeddingModels = {
  minilm: {
    load: vi.fn().mockResolvedValue({
      embed: vi.fn().mockImplementation((texts: string[]) => {
        const embeddings = texts.map(() => createMockEmbedding(384))
        return Promise.resolve({
          arraySync: () => embeddings,
          dispose: vi.fn(),
          shape: [texts.length, 384],
        })
      }),
      dispose: vi.fn(),
    }),
  },
  
  use: {
    load: vi.fn().mockResolvedValue({
      embed: vi.fn().mockImplementation((texts: string[]) => {
        const embeddings = texts.map(() => createMockEmbedding(512))
        return Promise.resolve({
          arraySync: () => embeddings,
          dispose: vi.fn(),
          shape: [texts.length, 512],
        })
      }),
      dispose: vi.fn(),
    }),
  },
}

/**
 * Mock similarity calculations
 */
export const mockSimilarity = {
  cosineSimilarity: vi.fn().mockImplementation((a: number[], b: number[]) => {
    // Simple mock that returns a value between 0 and 1
    return Math.random() * 0.5 + 0.3
  }),
  
  dotProduct: vi.fn().mockImplementation((a: number[], b: number[]) => {
    return Math.random() * 2 - 1
  }),
  
  euclideanDistance: vi.fn().mockImplementation((a: number[], b: number[]) => {
    return Math.random() * 2
  }),
}

/**
 * Mock embedding cache
 */
export const mockEmbeddingCache = {
  get: vi.fn().mockImplementation((key: string) => {
    if (key.includes('cached')) {
      return createMockEmbedding(384)
    }
    return null
  }),
  
  set: vi.fn(),
  has: vi.fn().mockImplementation((key: string) => key.includes('cached')),
  delete: vi.fn(),
  clear: vi.fn(),
  size: 0,
}

/**
 * Mock FlexSearch index
 */
export const mockFlexSearch = {
  Document: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    search: vi.fn().mockResolvedValue([
      { id: 1, score: 0.95 },
      { id: 2, score: 0.78 },
      { id: 3, score: 0.65 },
    ]),
    update: vi.fn(),
    clear: vi.fn(),
  })),
  
  Index: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    search: vi.fn().mockReturnValue([1, 2, 3]),
    update: vi.fn(),
    clear: vi.fn(),
  })),
}

/**
 * Mock AI service responses
 */
export const mockAIServiceResponses = {
  searchResults: [
    {
      id: 1,
      slug: 'test-article-1',
      title: 'Test Article 1',
      content: 'This is test content for the first article.',
      tags: ['test', 'article'],
      score: 0.95,
      explanation: 'High relevance based on keyword match',
    },
    {
      id: 2,
      slug: 'test-article-2', 
      title: 'Test Article 2',
      content: 'This is test content for the second article.',
      tags: ['test', 'example'],
      score: 0.78,
      explanation: 'Moderate relevance based on semantic similarity',
    },
  ],
  
  recommendations: [
    {
      slug: 'recommended-article',
      title: 'Recommended Article',
      description: 'This article is recommended for you',
      tags: ['recommendation', 'ai'],
      score: 0.89,
      explanation: 'Recommended based on your reading patterns',
    },
  ],
  
  writingSuggestions: [
    {
      type: 'grammar',
      message: 'Consider using "their" instead of "there"',
      position: { start: 10, end: 15 },
      confidence: 0.92,
    },
    {
      type: 'style',
      message: 'This sentence could be more concise',
      position: { start: 25, end: 40 },
      confidence: 0.78,
    },
  ],
}

/**
 * Reset all mocks - useful for test cleanup
 */
export const resetAllMocks = () => {
  vi.clearAllMocks()
  
  // Reset any stateful mocks
  mockEmbeddingCache.size = 0
}

/**
 * Setup global mocks for TensorFlow.js
 */
export const setupTensorFlowMocks = () => {
  // Mock @tensorflow/tfjs
  vi.mock('@tensorflow/tfjs', () => mockTensorFlow)
  
  // Mock @tensorflow-models/universal-sentence-encoder
  vi.mock('@tensorflow-models/universal-sentence-encoder', () => mockUniversalSentenceEncoder)
  
  // Mock FlexSearch
  vi.mock('flexsearch', () => ({ default: mockFlexSearch }))
  
  // Mock any global AI-related objects
  global.tf = mockTensorFlow as any
  global.use = mockUniversalSentenceEncoder as any
}

/**
 * Performance monitoring mocks
 */
export const mockPerformanceMonitor = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn().mockReturnValue([
    { duration: 50, name: 'ai-search' },
    { duration: 30, name: 'embedding-generation' },
  ]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
}

// Set up performance mocks
global.performance = {
  ...global.performance,
  ...mockPerformanceMonitor,
} as any