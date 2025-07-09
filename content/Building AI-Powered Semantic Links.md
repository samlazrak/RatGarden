---
title: Building AI-Powered Semantic Links for Digital Gardens
tags: [ai, machine-learning, semantic-analysis, digital-garden, knowledge-management, tensorflow, quartz, nlp, content-analysis]
date: 2025-01-09
---

# Building AI-Powered Semantic Links for Digital Gardens

## The Problem

My digital garden had dozens of notes on AI, biomedical research, art, and tech. But the connections between them? Invisible. Sure, I could manually link everything, but that doesn't scale.

The brain finds patterns across domains automatically. Note-taking systems don't. They rely on explicit links you remember to create. Missing: the subtle connections, the weak signals, the unexpected insights.

## The Solution

I built an AI system that automatically discovers and visualizes semantic connections between notes. It:
- Analyzes content similarity with TensorFlow.js
- Calculates relationship strength  
- Shows visual strength indicators
- Explains why content relates
- Surfaces weak connections you'd miss

## The Architecture

### Semantic Analysis Engine

TensorFlow.js Universal Sentence Encoder transforms text into embeddings that capture meaning:

```typescript
export class SemanticAnalyzer {
  async generateEmbedding(content: string, title: string, tags: string[], slug: FullSlug): Promise<SemanticEmbedding> {
    if (!isBrowser) {
      return {
        slug,
        embedding: new Array(512).fill(0), // Placeholder during build
        content: this.prepareTextForEmbedding(title, content, tags),
        title,
        tags,
        lastUpdated: new Date()
      }
    }
    
    const model = await use.load()
    const embeddings = await model.embed(processedContent)
    return embeddings.arraySync()[0]
  }
}
```

Key insight: dual-mode operation. Placeholders during build, real AI in the browser.

### Similarity Calculation

Cosine similarity for semantic matching:

```typescript
calculateCosineSimilarity(embeddingA: number[], embeddingB: number[]): number {
  const dotProduct = embeddingA.reduce((sum, a, i) => sum + a * embeddingB[i], 0)
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}
```

Build-time fallback uses tag-based similarity:

```typescript
function generateTagBasedSuggestions(sourceEmbedding: SemanticEmbedding, allEmbeddings: SemanticEmbedding[]): SemanticLink[] {
  const suggestions: SemanticLink[] = []
  
  for (const targetEmbedding of allEmbeddings) {
    const sharedTags = sourceEmbedding.tags.filter(tag => 
      targetEmbedding.tags.includes(tag)
    )
    
    if (sharedTags.length > 0) {
      const strength = Math.min(sharedTags.length / Math.max(sourceEmbedding.tags.length, 1), 1.0)
      suggestions.push({
        target: targetEmbedding.slug,
        strength,
        type: "tag-based",
        explanation: `Shares tags: ${sharedTags.join(", ")}`
      })
    }
  }
  
  return suggestions.sort((a, b) => b.strength - a.strength)
}
```

### Static Site Integration

Embedded semantic discovery into Quartz's ContentIndex emitter:

```typescript
export const ContentIndex: QuartzEmitterPlugin<Partial<Options>> = (opts) => {
  return {
    name: "ContentIndex",
    async *emit(ctx, content) {
      await generateSemanticLinks(content)
      
      for (const [tree, file] of content) {
        const slug = file.data.slug!
        
        linkIndex.set(slug, {
          semanticEmbedding: file.data.semanticEmbedding,
          semanticLinks: file.data.semanticLinks,
          crossReferenceStrength: file.data.crossReferenceStrength,
        })
      }
    }
  }
}
```

## The Interface

Visual indicators transform math into intuition:

```typescript
const SemanticLinks: QuartzComponent = ({ fileData, allFiles }) => {
  const semanticLinks = fileData.semanticLinks || []
  
  const strengthColor = (strength: number): string => {
    if (strength >= 0.7) return "semantic-strong"
    if (strength >= 0.5) return "semantic-medium"  
    return "semantic-weak"
  }

  return (
    <div class="semantic-links">
      <h3>Related Content</h3>
      {filteredLinks.map(link => (
        <div class={`semantic-link-item ${strengthColor(link.strength)}`}>
          <a href={resolveRelative(fileData.slug!, link.target)}>
            {targetTitle}
          </a>
          <span class={`semantic-strength ${strengthColor(link.strength)}`}>
            {Math.round(link.strength * 100)}%
          </span>
          <span class="semantic-explanation">
            {link.explanation}
          </span>
        </div>
      ))}
    </div>
  )
}
```

## Results

Live connections I'd never find manually:

- **"Book Arts" ↔ "My Art" (17%)**: Shared "art" tags, sentiment aligned
- **"PhD Research" ↔ "Publications" (14%)**: Research links with emotional context
- **Cross-domain insights**: Biomedical research connects to AI projects

**Sentiment Features:**
- Emotional compatibility (🤝 aligned, 🔄 different)
- Color-coded sentiment (😊 positive, 😞 negative, 😐 neutral)
- Explanations include sentiment analysis
- Optional sentiment-weighted similarity

## What I Learned

Traditional knowledge management: remembering connections.  
AI-powered knowledge management: discovering connections.

The system surfaces what I might not notice. The weak connections (14-20%) matter most—they're where innovation happens at the fuzzy boundaries between ideas.

## Future Directions

### Next Steps:
1. **Multi-Modal Analysis**: Connect images, videos with text
2. **Temporal Evolution**: Track how relationships change over time
3. **Citation Networks**: Map scholarly influences automatically
4. **Concept Drift**: Detect when I'm exploring new territories
5. **Collaborative Gardens**: Inter-personal semantic networks
6. **Automated Taxonomy**: Discover emergent categories via clustering
7. **Gap Analysis**: Find isolated idea clusters

### Already Built: Sentiment-Aware Linking ✅

- Lexicon-based analyzer: polarity, subjectivity, emotion scores
- Visual indicators: 😊 positive, 😞 negative, 😐 neutral
- Alignment symbols: 🤝 (strong), 👍 (same emotion), 🔄 (different)
- Sentiment-weighted similarity calculations

```typescript
// Sentiment integration
const sentiment = this.sentimentAnalyzer.analyzeSentiment(combinedText)

// Sentiment-aware similarity
calculateSentimentAwareSimilarity(source, target, {
  sentimentWeight: 0.3,
  preferSameEmotion: true,
  polarityTolerance: 1.0
})
```

## The Bigger Picture

Cognitive amplification, not replacement. The system shows connections to explore, not what to think.

My digital garden is both knowledge repository and learning laboratory. Each project teaches how AI can make human intelligence more powerful.

## Technical Notes

**Key patterns:**
- Graceful degradation (AI features degrade when resources limited)
- Hybrid analysis (tags + AI models)
- Static-dynamic integration
- Browser-based ML (no backend needed)

**Files:**
- `quartz/util/semantic.ts`: Core analysis + sentiment
- `quartz/components/SemanticLinks.tsx`: Frontend display
- `quartz/plugins/emitters/contentIndex.tsx`: Build integration
- `quartz/components/styles/semanticLinks.scss`: Styling

Modern browsers run ML models locally. Privacy-respecting, works offline.

---

*Each project teaches new lessons about human-machine intelligence intersection.*