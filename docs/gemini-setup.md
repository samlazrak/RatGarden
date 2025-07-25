# Gemini API Setup for AI Assistant

This guide explains how to set up your Gemini API key to use the AI Writing Assistant with Google's Gemini models.

## Getting Your Gemini API Key

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign In**: Use your Google account to sign in

3. **Create API Key**: Click "Create API Key" to generate a new key

4. **Copy the Key**: Copy the generated API key (it will look like `AIzaSyC...`)

## Setting Up Environment Variables

### For Local Development

Create a `.env` file in your project root:

```bash
# AI API Keys
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional: Other API keys for fallback
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### For Production Deployment

#### Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `GEMINI_API_KEY` with your API key value
4. Deploy your project

#### Netlify

1. Go to your Netlify site dashboard
2. Navigate to Site settings → Environment variables
3. Add `GEMINI_API_KEY` with your API key value
4. Trigger a new deployment

#### Other Platforms

Add the `GEMINI_API_KEY` environment variable to your hosting platform's configuration.

## Configuration

The AI Writing Assistant is configured to use Gemini by default in `quartz.layout.ts`:

```typescript
Component.AIWritingAssistant({
  features: ["grammar", "style", "suggestions", "completion"],
  provider: "gemini", // Uses Gemini API
  position: "floating",
  apiEndpoint: "/api/ai-assistant",
}),
```

## Features Available

With Gemini, you can use these AI features:

- **Grammar Checking**: Find and fix grammar and spelling errors
- **Style Analysis**: Improve writing style and clarity
- **Content Suggestions**: Get ideas for improving your content
- **Text Completion**: Continue writing naturally
- **Summarization**: Create concise summaries (if enabled)

## Cost Optimization

The system automatically optimizes costs by:

- Using Gemini 1.5 Flash for simple tasks (cheaper)
- Using Gemini 1.5 Pro for complex tasks (more capable)
- Limiting token usage based on feature type
- Implementing caching to reduce API calls

## Troubleshooting

### "API key not configured" Error

- Make sure your `.env` file exists and contains the `GEMINI_API_KEY`
- Verify the API key is correct and active
- Check that your deployment platform has the environment variable set

### "Gemini API error" Messages

- Check your API key is valid
- Verify you have sufficient quota remaining
- Ensure your account is not suspended

### Fallback Behavior

If Gemini is unavailable, the system will automatically fall back to:

1. OpenAI (if configured)
2. Anthropic (if configured)
3. Mock responses (for demo purposes)

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used server-side in edge functions
- No API keys are exposed to the client-side code
