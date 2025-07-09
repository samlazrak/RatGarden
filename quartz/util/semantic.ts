import * as use from "@tensorflow-models/universal-sentence-encoder"
import * as tf from "@tensorflow/tfjs-node"
import { FullSlug } from "./path"

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export interface SemanticEmbedding {
  slug: FullSlug
  embedding: number[]
  content: string
  title: string
  tags: string[]
  lastUpdated: Date
}

export interface SemanticLink {
  target: FullSlug
  strength: number
  confidence: number
  type: "semantic" | "tag-based" | "explicit"
  explanation?: string
}

export interface CrossReferenceStrength {
  source: FullSlug
  target: FullSlug
  strength: number
  bidirectional: boolean
  factors: {
    semanticSimilarity: number
    sharedTags: number
    contentOverlap: number
    linkFrequency: number
  }
}

export class SemanticAnalyzer {
  private model: use.UniversalSentenceEncoder | null = null
  private embeddingCache: Map<string, SemanticEmbedding> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    // Skip initialization during build time (Node.js environment)
    if (!isBrowser) {
      console.log("Skipping semantic analysis initialization in Node.js environment")
      return
    }
    
    try {
      console.log("Loading Universal Sentence Encoder model...")
      this.model = await use.load()
      this.initialized = true
      console.log("Semantic analysis model loaded successfully")
    } catch (error) {
      console.error("Failed to load semantic analysis model:", error)
      throw error
    }
  }

  async generateEmbedding(content: string, title: string, tags: string[], slug: FullSlug): Promise<SemanticEmbedding> {
    // Skip during build time in Node.js environment
    if (!isBrowser) {
      return {
        slug,
        embedding: new Array(512).fill(0), // Placeholder embedding
        content: this.prepareTextForEmbedding(title, content, tags),
        title,
        tags,
        lastUpdated: new Date()
      }
    }
    
    if (!this.model) {
      throw new Error("SemanticAnalyzer not initialized. Call initialize() first.")
    }

    const cacheKey = `${slug}-${this.hashContent(content)}`
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!
    }

    // Combine title, content, and tags for comprehensive embedding
    const combinedText = this.prepareTextForEmbedding(title, content, tags)
    
    try {
      const embeddings = await this.model.embed([combinedText])
      const embeddingArray = await embeddings.data()
      embeddings.dispose() // Clean up tensor memory
      
      // Convert to regular array (first 512 values for the single text)
      const embedding = Array.from(embeddingArray).slice(0, 512)
      
      const semanticEmbedding: SemanticEmbedding = {
        slug,
        embedding,
        content: combinedText,
        title,
        tags,
        lastUpdated: new Date()
      }
      
      this.embeddingCache.set(cacheKey, semanticEmbedding)
      return semanticEmbedding
    } catch (error) {
      console.error(`Failed to generate embedding for ${slug}:`, error)
      throw error
    }
  }

  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same length")
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) {
      return 0
    }

    return dotProduct / (norm1 * norm2)
  }

  suggestSemanticLinks(
    sourceEmbedding: SemanticEmbedding,
    allEmbeddings: SemanticEmbedding[],
    options: {
      minSimilarity?: number
      maxSuggestions?: number
      excludeSelf?: boolean
    } = {}
  ): SemanticLink[] {
    const {
      minSimilarity = 0.3,
      maxSuggestions = 10,
      excludeSelf = true
    } = options

    const suggestions: SemanticLink[] = []

    for (const targetEmbedding of allEmbeddings) {
      if (excludeSelf && targetEmbedding.slug === sourceEmbedding.slug) {
        continue
      }

      const similarity = this.calculateCosineSimilarity(
        sourceEmbedding.embedding,
        targetEmbedding.embedding
      )

      if (similarity >= minSimilarity) {
        const link: SemanticLink = {
          target: targetEmbedding.slug,
          strength: similarity,
          confidence: this.calculateConfidence(similarity, sourceEmbedding, targetEmbedding),
          type: this.determineSemanticLinkType(sourceEmbedding, targetEmbedding),
          explanation: this.generateLinkExplanation(sourceEmbedding, targetEmbedding, similarity)
        }

        suggestions.push(link)
      }
    }

    // Sort by strength (highest first) and limit results
    return suggestions
      .sort((a, b) => b.strength - a.strength)
      .slice(0, maxSuggestions)
  }

  calculateCrossReferenceStrength(
    source: SemanticEmbedding,
    target: SemanticEmbedding,
    existingLinks: { [key: string]: string[] } = {}
  ): CrossReferenceStrength {
    const semanticSimilarity = this.calculateCosineSimilarity(source.embedding, target.embedding)
    const sharedTags = this.calculateSharedTagsScore(source.tags, target.tags)
    const contentOverlap = this.calculateContentOverlap(source.content, target.content)
    const linkFrequency = this.calculateLinkFrequency(source.slug, target.slug, existingLinks)

    // Weighted combination of factors
    const strength = (
      semanticSimilarity * 0.5 +
      sharedTags * 0.2 +
      contentOverlap * 0.2 +
      linkFrequency * 0.1
    )

    return {
      source: source.slug,
      target: target.slug,
      strength: Math.min(strength, 1.0), // Cap at 1.0
      bidirectional: this.isBidirectionalLink(source.slug, target.slug, existingLinks),
      factors: {
        semanticSimilarity,
        sharedTags,
        contentOverlap,
        linkFrequency
      }
    }
  }

  private prepareTextForEmbedding(title: string, content: string, tags: string[]): string {
    // Clean and combine text components
    const cleanContent = this.cleanMarkdown(content)
    const tagText = tags.length > 0 ? `Tags: ${tags.join(", ")}` : ""
    
    return `${title}\n\n${cleanContent}\n\n${tagText}`.trim()
  }

  private cleanMarkdown(content: string): string {
    // Remove markdown syntax for better semantic understanding
    return content
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim()
  }

  private calculateSharedTagsScore(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 || tags2.length === 0) return 0
    
    const set1 = new Set(tags1)
    const set2 = new Set(tags2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size // Jaccard similarity
  }

  private calculateContentOverlap(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/))
    const words2 = new Set(content2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  private calculateLinkFrequency(
    source: FullSlug,
    target: FullSlug,
    existingLinks: { [key: string]: string[] }
  ): number {
    const sourceLinks = existingLinks[source] || []
    const targetLinks = existingLinks[target] || []
    
    let frequency = 0
    if (sourceLinks.includes(target)) frequency += 0.5
    if (targetLinks.includes(source)) frequency += 0.5
    
    return frequency
  }

  private isBidirectionalLink(
    source: FullSlug,
    target: FullSlug,
    existingLinks: { [key: string]: string[] }
  ): boolean {
    const sourceLinks = existingLinks[source] || []
    const targetLinks = existingLinks[target] || []
    
    return sourceLinks.includes(target) && targetLinks.includes(source)
  }

  private calculateConfidence(
    similarity: number,
    source: SemanticEmbedding,
    target: SemanticEmbedding
  ): number {
    // Higher confidence for:
    // - Higher similarity
    // - Shared tags
    // - Recent content
    
    let confidence = similarity
    
    // Boost confidence for shared tags
    if (source.tags.some(tag => target.tags.includes(tag))) {
      confidence *= 1.2
    }
    
    // Boost confidence for recent content
    const daysSinceUpdate = (Date.now() - source.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 30) {
      confidence *= 1.1
    }
    
    return Math.min(confidence, 1.0)
  }

  private determineSemanticLinkType(
    source: SemanticEmbedding,
    target: SemanticEmbedding
  ): "semantic" | "tag-based" | "explicit" {
    // Check if they share tags
    if (source.tags.some(tag => target.tags.includes(tag))) {
      return "tag-based"
    }
    
    // Default to semantic
    return "semantic"
  }

  private generateLinkExplanation(
    source: SemanticEmbedding,
    target: SemanticEmbedding,
    similarity: number
  ): string {
    const sharedTags = source.tags.filter(tag => target.tags.includes(tag))
    
    if (sharedTags.length > 0) {
      return `Shares tags: ${sharedTags.join(", ")} (${(similarity * 100).toFixed(1)}% similarity)`
    }
    
    return `Semantically similar content (${(similarity * 100).toFixed(1)}% similarity)`
  }

  private hashContent(content: string): string {
    // Simple hash function for cache keys
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  clearCache(): void {
    this.embeddingCache.clear()
  }

  getCacheSize(): number {
    return this.embeddingCache.size
  }
}

// Global instance
export const semanticAnalyzer = new SemanticAnalyzer()