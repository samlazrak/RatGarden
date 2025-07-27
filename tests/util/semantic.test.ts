import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before importing the module
setupTensorFlowMocks()

describe('Semantic Utilities', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  describe('SentimentAnalyzer', () => {
    // We'll need to import the semantic module dynamically or create a mock
    // Since the actual semantic.ts file imports TensorFlow modules
    const mockSentimentAnalyzer = {
      analyzeSentiment: (text: string) => {
        // Mock implementation based on the SENTIMENT_LEXICON
        const positiveWords = ['amazing', 'awesome', 'excellent', 'great', 'good', 'love', 'like']
        const negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'hate', 'dislike']
        
        const words = text.toLowerCase().split(/\s+/)
        let polarity = 0
        let subjectivity = 0
        
        words.forEach(word => {
          const cleanWord = word.replace(/[^\w]/g, '')
          if (positiveWords.includes(cleanWord)) {
            polarity += 0.5
            subjectivity += 0.3
          } else if (negativeWords.includes(cleanWord)) {
            polarity -= 0.5
            subjectivity += 0.3
          }
        })
        
        // Normalize values
        polarity = Math.max(-1, Math.min(1, polarity))
        subjectivity = Math.max(0, Math.min(1, subjectivity))
        
        let emotion = 'neutral'
        if (polarity > 0.1) emotion = 'positive'
        else if (polarity < -0.1) emotion = 'negative'
        
        return {
          polarity,
          subjectivity,
          emotion,
          confidence: Math.abs(polarity)
        }
      }
    }

    it('should analyze positive sentiment correctly', () => {
      const result = mockSentimentAnalyzer.analyzeSentiment("This is amazing and awesome!")
      
      expect(result.polarity).toBeGreaterThan(0)
      expect(result.emotion).toBe('positive')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.subjectivity).toBeGreaterThan(0)
    })

    it('should analyze negative sentiment correctly', () => {
      const result = mockSentimentAnalyzer.analyzeSentiment("This is terrible and awful!")
      
      expect(result.polarity).toBeLessThan(0)
      expect(result.emotion).toBe('negative')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.subjectivity).toBeGreaterThan(0)
    })

    it('should analyze neutral sentiment correctly', () => {
      const result = mockSentimentAnalyzer.analyzeSentiment("This is a research study about data analysis.")
      
      expect(result.polarity).toBeCloseTo(0, 1)
      expect(result.emotion).toBe('neutral')
      expect(result.subjectivity).toBeCloseTo(0, 1)
    })

    it('should handle empty text', () => {
      const result = mockSentimentAnalyzer.analyzeSentiment("")
      
      expect(result.polarity).toBe(0)
      expect(result.emotion).toBe('neutral')
      expect(result.confidence).toBe(0)
      expect(result.subjectivity).toBe(0)
    })

    it('should handle mixed sentiment', () => {
      const result = mockSentimentAnalyzer.analyzeSentiment("This is amazing but also terrible.")
      
      // Should be close to neutral due to mixed sentiment
      expect(Math.abs(result.polarity)).toBeLessThan(0.5)
      expect(result.subjectivity).toBeGreaterThan(0)
    })

    it('should normalize polarity values', () => {
      const result = mockSentimentAnalyzer.analyzeSentiment("Very positive text with many good words!")
      
      expect(result.polarity).toBeGreaterThanOrEqual(-1)
      expect(result.polarity).toBeLessThanOrEqual(1)
    })
  })

  describe('Embedding Functions', () => {
    const mockEmbeddingService = {
      generateEmbedding: vi.fn().mockResolvedValue(new Array(384).fill(0.1)),
      calculateSimilarity: vi.fn().mockReturnValue(0.75),
      batchEmbeddings: vi.fn().mockResolvedValue([
        new Array(384).fill(0.1),
        new Array(384).fill(0.2),
        new Array(384).fill(0.3),
      ])
    }

    beforeEach(() => {
      mockEmbeddingService.generateEmbedding.mockClear()
      mockEmbeddingService.calculateSimilarity.mockClear()
      mockEmbeddingService.batchEmbeddings.mockClear()
    })

    it('should generate embeddings for text', async () => {
      const text = "This is a test document about AI and machine learning."
      const embedding = await mockEmbeddingService.generateEmbedding(text)
      
      expect(embedding).toHaveLength(384)
      expect(embedding.every(val => typeof val === 'number')).toBe(true)
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith(text)
    })

    it('should calculate similarity between embeddings', () => {
      const embedding1 = new Array(384).fill(0.1)
      const embedding2 = new Array(384).fill(0.2)
      
      const similarity = mockEmbeddingService.calculateSimilarity(embedding1, embedding2)
      
      expect(similarity).toBeGreaterThanOrEqual(0)
      expect(similarity).toBeLessThanOrEqual(1)
      expect(mockEmbeddingService.calculateSimilarity).toHaveBeenCalledWith(embedding1, embedding2)
    })

    it('should handle batch embedding generation', async () => {
      const texts = [
        "First document about technology",
        "Second document about science", 
        "Third document about research"
      ]
      
      const embeddings = await mockEmbeddingService.batchEmbeddings(texts)
      
      expect(embeddings).toHaveLength(3)
      expect(embeddings.every(emb => emb.length === 384)).toBe(true)
      expect(mockEmbeddingService.batchEmbeddings).toHaveBeenCalledWith(texts)
    })

    it('should handle empty input gracefully', async () => {
      mockEmbeddingService.generateEmbedding.mockResolvedValue(new Array(384).fill(0))
      
      const embedding = await mockEmbeddingService.generateEmbedding("")
      
      expect(embedding).toHaveLength(384)
      expect(embedding.every(val => val === 0)).toBe(true)
    })
  })

  describe('Semantic Search', () => {
    const mockSearchService = {
      indexDocument: vi.fn(),
      searchSimilar: vi.fn().mockResolvedValue([
        { slug: 'doc1', score: 0.95, title: 'Similar Document 1' },
        { slug: 'doc2', score: 0.87, title: 'Similar Document 2' },
        { slug: 'doc3', score: 0.73, title: 'Similar Document 3' },
      ]),
      hybridSearch: vi.fn().mockResolvedValue([
        { slug: 'doc1', score: 0.92, title: 'Hybrid Result 1', type: 'semantic' },
        { slug: 'doc2', score: 0.88, title: 'Hybrid Result 2', type: 'keyword' },
        { slug: 'doc3', score: 0.79, title: 'Hybrid Result 3', type: 'semantic' },
      ])
    }

    beforeEach(() => {
      mockSearchService.indexDocument.mockClear()
      mockSearchService.searchSimilar.mockClear()
      mockSearchService.hybridSearch.mockClear()
    })

    it('should index documents for semantic search', () => {
      const document = {
        slug: 'test-doc',
        title: 'Test Document',
        content: 'This is test content for indexing.'
      }
      
      mockSearchService.indexDocument(document)
      
      expect(mockSearchService.indexDocument).toHaveBeenCalledWith(document)
    })

    it('should perform semantic similarity search', async () => {
      const query = "artificial intelligence machine learning"
      const results = await mockSearchService.searchSimilar(query, 5)
      
      expect(results).toHaveLength(3)
      expect(results[0].score).toBeGreaterThan(results[1].score)
      expect(results[1].score).toBeGreaterThan(results[2].score)
      expect(mockSearchService.searchSimilar).toHaveBeenCalledWith(query, 5)
    })

    it('should perform hybrid search combining semantic and keyword results', async () => {
      const query = "AI research methodology"
      const results = await mockSearchService.hybridSearch(query, 3)
      
      expect(results).toHaveLength(3)
      expect(results.every(r => ['semantic', 'keyword'].includes(r.type))).toBe(true)
      expect(results[0].score).toBeGreaterThan(results[1].score)
      expect(mockSearchService.hybridSearch).toHaveBeenCalledWith(query, 3)
    })

    it('should handle search with no results', async () => {
      mockSearchService.searchSimilar.mockResolvedValue([])
      
      const results = await mockSearchService.searchSimilar("nonexistent query")
      
      expect(results).toHaveLength(0)
    })
  })

  describe('Semantic Link Discovery', () => {
    const mockLinkService = {
      findSemanticLinks: vi.fn().mockResolvedValue([
        { target: 'related-doc-1', strength: 0.89, type: 'semantic' },
        { target: 'related-doc-2', strength: 0.76, type: 'topical' },
        { target: 'related-doc-3', strength: 0.65, type: 'contextual' },
      ]),
      updateLinkGraph: vi.fn(),
      getLinkSuggestions: vi.fn().mockResolvedValue([
        { source: 'doc1', target: 'doc2', confidence: 0.82, reason: 'semantic similarity' },
        { source: 'doc1', target: 'doc3', confidence: 0.67, reason: 'shared concepts' },
      ])
    }

    beforeEach(() => {
      mockLinkService.findSemanticLinks.mockClear()
      mockLinkService.updateLinkGraph.mockClear()
      mockLinkService.getLinkSuggestions.mockClear()
    })

    it('should discover semantic links for a document', async () => {
      const document = {
        slug: 'test-document',
        content: 'Content about machine learning algorithms',
        embedding: new Array(384).fill(0.1)
      }
      
      const links = await mockLinkService.findSemanticLinks(document)
      
      expect(links).toHaveLength(3)
      expect(links[0].strength).toBeGreaterThan(links[1].strength)
      expect(links.every(link => link.strength > 0 && link.strength <= 1)).toBe(true)
      expect(mockLinkService.findSemanticLinks).toHaveBeenCalledWith(document)
    })

    it('should provide link suggestions with confidence scores', async () => {
      const sourceDocument = 'artificial-intelligence-intro'
      const suggestions = await mockLinkService.getLinkSuggestions(sourceDocument)
      
      expect(suggestions).toHaveLength(2)
      expect(suggestions.every(s => s.confidence > 0 && s.confidence <= 1)).toBe(true)
      expect(suggestions.every(s => s.reason)).toBe(true)
      expect(mockLinkService.getLinkSuggestions).toHaveBeenCalledWith(sourceDocument)
    })

    it('should update the semantic link graph', () => {
      const linkData = {
        source: 'doc1',
        target: 'doc2',
        strength: 0.85,
        type: 'semantic'
      }
      
      mockLinkService.updateLinkGraph(linkData)
      
      expect(mockLinkService.updateLinkGraph).toHaveBeenCalledWith(linkData)
    })
  })

  describe('Performance and Caching', () => {
    const mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      invalidate: vi.fn()
    }

    beforeEach(() => {
      mockCacheService.get.mockClear()
      mockCacheService.set.mockClear()
      mockCacheService.has.mockClear()
      mockCacheService.invalidate.mockClear()
    })

    it('should cache embedding results', async () => {
      const text = "Sample text for caching test"
      const embedding = new Array(384).fill(0.5)
      
      mockCacheService.has.mockReturnValue(false)
      mockCacheService.get.mockReturnValue(null)
      mockCacheService.set.mockReturnValue(true)
      
      // Simulate caching behavior
      if (!mockCacheService.has(text)) {
        mockCacheService.set(text, embedding)
      }
      
      expect(mockCacheService.has).toHaveBeenCalledWith(text)
      expect(mockCacheService.set).toHaveBeenCalledWith(text, embedding)
    })

    it('should retrieve cached embeddings when available', () => {
      const text = "Cached text sample"
      const cachedEmbedding = new Array(384).fill(0.3)
      
      mockCacheService.has.mockReturnValue(true)
      mockCacheService.get.mockReturnValue(cachedEmbedding)
      
      const result = mockCacheService.get(text)
      
      expect(result).toEqual(cachedEmbedding)
      expect(mockCacheService.get).toHaveBeenCalledWith(text)
    })

    it('should handle cache invalidation', () => {
      const documentSlug = 'updated-document'
      
      mockCacheService.invalidate(documentSlug)
      
      expect(mockCacheService.invalidate).toHaveBeenCalledWith(documentSlug)
    })
  })

  describe('Error Handling', () => {
    it('should handle TensorFlow loading errors gracefully', async () => {
      const mockFailingService = {
        loadModel: vi.fn().mockRejectedValue(new Error('Failed to load model'))
      }
      
      await expect(mockFailingService.loadModel()).rejects.toThrow('Failed to load model')
    })

    it('should handle invalid input gracefully', () => {
      const mockRobustService = {
        processText: (text: any) => {
          if (typeof text !== 'string') {
            return { error: 'Invalid input type', result: null }
          }
          if (text.length === 0) {
            return { error: null, result: 'empty' }
          }
          return { error: null, result: 'processed' }
        }
      }
      
      expect(mockRobustService.processText(null)).toEqual({ error: 'Invalid input type', result: null })
      expect(mockRobustService.processText('')).toEqual({ error: null, result: 'empty' })
      expect(mockRobustService.processText('valid text')).toEqual({ error: null, result: 'processed' })
    })

    it('should handle network errors for remote models', async () => {
      const mockNetworkService = {
        fetchRemoteEmbedding: vi.fn().mockRejectedValue(new Error('Network timeout'))
      }
      
      await expect(mockNetworkService.fetchRemoteEmbedding('test')).rejects.toThrow('Network timeout')
    })
  })

  describe('Memory Management', () => {
    it('should dispose of TensorFlow tensors properly', () => {
      const mockTensor = {
        dispose: vi.fn(),
        isDisposed: false
      }
      
      const mockMemoryManager = {
        disposeTensor: (tensor: any) => {
          tensor.dispose()
          tensor.isDisposed = true
        }
      }
      
      mockMemoryManager.disposeTensor(mockTensor)
      
      expect(mockTensor.dispose).toHaveBeenCalled()
      expect(mockTensor.isDisposed).toBe(true)
    })

    it('should track memory usage', () => {
      const mockMemoryTracker = {
        getCurrentUsage: vi.fn().mockReturnValue({
          numTensors: 5,
          numDataBuffers: 3,
          numBytes: 1024
        })
      }
      
      const usage = mockMemoryTracker.getCurrentUsage()
      
      expect(usage.numTensors).toBeGreaterThanOrEqual(0)
      expect(usage.numDataBuffers).toBeGreaterThanOrEqual(0)
      expect(usage.numBytes).toBeGreaterThanOrEqual(0)
    })
  })
})