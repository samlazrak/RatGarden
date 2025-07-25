# The Rat's Garden 🌿

A modern digital garden built with Quartz 4, enhanced with AI-powered features for improved content discovery and creation.

## Features

### 🔍 AI-Powered Search
- **Hybrid Search Modes**: Switch between keyword, semantic, and hybrid search
- **Contextual Understanding**: Find related content even without exact keyword matches
- **Real-time Mode Switching**: Toggle search modes on the fly
- **Search Explanations**: Understand why results were matched

### 🎯 Personalized Content Recommendations
- **Three Modes**:
  - Related: Find similar content based on current page
  - Personalized: Recommendations adapt to your reading history
  - Trending: Discover popular and recently updated content
- **Privacy-First**: All personalization data stays in your browser
- **Smart Algorithms**: Combines tag similarity, content analysis, and reading patterns

### ✍️ AI Writing Assistant
- **Grammar & Style Checking**: Real-time suggestions for clarity and correctness
- **Content Suggestions**: Get ideas to expand and improve your writing
- **Smart Completion**: AI helps finish your sentences and paragraphs
- **Floating Interface**: Accessible from any content page without interrupting your flow

### 🎮 Interactive AI Demos
- **Browser-Based AI**: Experience machine learning directly in your browser
- **Multiple Demo Types**:
  - Text Classification & Sentiment Analysis
  - Image Classification
  - Text Generation
- **No Setup Required**: Models run using WebAssembly for near-native performance

## Getting Started

### Prerequisites
- Node.js 18+ and npm v9+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/samlazrak/RatGarden.git
cd RatGarden

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see your digital garden.

### Building for Production

```bash
npm run build
```

The static site will be generated in the `public/` directory.

## Project Structure

```
RatGarden/
├── content/          # Your markdown content
│   ├── blog/        # Blog posts
│   ├── demos/       # Interactive demo pages
│   └── docs/        # Documentation
├── quartz/          # Quartz framework
│   ├── components/  # React/Preact components
│   │   ├── AISearch.tsx
│   │   ├── AIRecommendations.tsx
│   │   ├── AIWritingAssistant.tsx
│   │   └── InteractiveAIDemo.tsx
│   └── plugins/     # Build plugins
└── public/          # Generated static site
```

## Configuration

### AI Features Configuration

In `quartz.layout.ts`, you can customize AI components:

```typescript
// AI Search with custom settings
Component.AISearch({
  enablePreview: true,
  searchMode: "hybrid",
  maxResults: 8,
})

// Personalized recommendations
Component.AIRecommendations({
  mode: "personalized",
  maxItems: 5,
  showDescription: true,
})

// Writing assistant (currently in mock mode)
Component.AIWritingAssistant({
  features: ["grammar", "style", "suggestions"],
  provider: "mock",
})
```

### Enabling Real AI Models

The writing assistant currently uses mock responses. To enable real AI:

1. Set up an edge function (Vercel/Cloudflare)
2. Add your API keys as environment variables
3. Update the provider in configuration:

```typescript
Component.AIWritingAssistant({
  provider: "openai", // or "anthropic"
  apiEndpoint: "/api/ai-assistant"
})
```

## Key Technologies

- **Quartz 4**: Static site generator optimized for digital gardens
- **Preact**: Lightweight React alternative for smaller bundle sizes
- **TypeScript**: Type-safe development experience
- **SCSS**: Advanced styling with variables and mixins
- **WebAssembly**: For running AI models in the browser

## Performance

- **Fast Searches**: Average query time under 50ms
- **Lightweight**: AI features add minimal overhead to page load
- **Progressive Enhancement**: Site works without JavaScript, AI features enhance the experience
- **Caching**: Intelligent caching for API responses and model outputs

## Privacy

- **Local Personalization**: Reading history and preferences stored only in browser
- **No Tracking**: No analytics or user tracking on AI features
- **Client-Side Processing**: Many AI features run entirely in your browser
- **Transparent**: All AI interactions clearly indicated

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built on [Quartz](https://quartz.jzhao.xyz/) by Jacky Zhao
- AI features inspired by modern digital garden innovations
- Community feedback and contributions

---

For more information, visit [garden.samlazrak.com](https://garden.samlazrak.com)