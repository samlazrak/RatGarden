// Multi-Provider AI Assistant API for RatGarden
// Supports OpenAI, Anthropic, and Gemini APIs

export const config = {
  runtime: "edge",
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export default async function handler(req) {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  // Check if at least one API key is configured
  if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY && !GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "No API keys configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { text, feature, provider = "gemini", context } = await req.json()

    // Simple rate limiting check could go here

    // Determine which provider to use based on available API keys
    let selectedProvider = provider
    if (provider === "gemini" && !GEMINI_API_KEY) {
      if (OPENAI_API_KEY) selectedProvider = "openai"
      else if (ANTHROPIC_API_KEY) selectedProvider = "anthropic"
      else {
        return new Response(JSON.stringify({ error: "No API keys configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    } else if (provider === "openai" && !OPENAI_API_KEY) {
      if (GEMINI_API_KEY) selectedProvider = "gemini"
      else if (ANTHROPIC_API_KEY) selectedProvider = "anthropic"
      else {
        return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    } else if (provider === "anthropic" && !ANTHROPIC_API_KEY) {
      if (GEMINI_API_KEY) selectedProvider = "gemini"
      else if (OPENAI_API_KEY) selectedProvider = "openai"
      else {
        return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    let aiResponse

    switch (selectedProvider) {
      case "gemini":
        aiResponse = await callGeminiAPI(text, feature, context)
        break
      case "openai":
        aiResponse = await callOpenAIAPI(text, feature)
        break
      case "anthropic":
        aiResponse = await callAnthropicAPI(text, feature, context)
        break
      default:
        return new Response(JSON.stringify({ error: "Unsupported provider" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("AI Assistant error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}

// Helper functions for each API provider
async function callGeminiAPI(text, feature, context = "") {
  const maxTokens = getMaxTokensForFeature(feature)
  const model = getOptimalGeminiModel(feature, text.length)

  let systemPrompt = getSystemPrompt(feature)
  let userPrompt = buildUserPrompt(text, feature, context)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40,
        },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Invalid response from Gemini API")
  }

  return parseResponse(data.candidates[0].content.parts[0].text, feature)
}

async function callOpenAIAPI(text, feature) {
  let prompt = ""
  let model = "gpt-3.5-turbo" // Use cheaper model for cost efficiency

  switch (feature) {
    case "grammar":
      prompt = `Check the following text for grammar and spelling errors. Provide corrections in this JSON format:
{
  "corrections": [{"text": "error", "replacement": "correction", "reason": "explanation", "type": "grammar"}],
  "suggestions": ["general improvement suggestions"],
  "score": {"grammar": 85, "clarity": 90, "engagement": 80}
}

Text: ${text}`
      break

    case "style":
      prompt = `Analyze the writing style of this text and suggest improvements. Format response as JSON:
{
  "corrections": [{"text": "weak phrase", "replacement": "stronger phrase", "reason": "explanation", "type": "style"}],
  "suggestions": ["style improvement suggestions"],
  "score": {"grammar": 85, "clarity": 90, "engagement": 80}
}

Text: ${text}`
      break

    case "suggestions":
      prompt = `Provide content suggestions for this text. Format as JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Text: ${text}`
      break

    case "completion":
      prompt = `Continue this text naturally. Return JSON:
{
  "completion": "your continuation here"
}

Text: ${text}`
      break

    default:
      prompt = `Analyze this text and provide feedback. Format as JSON with corrections, suggestions, and scores.

Text: ${text}`
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

async function callAnthropicAPI(text, feature, context = "") {
  const maxTokens = getMaxTokensForFeature(feature)
  const model = getOptimalAnthropicModel(feature, text.length)

  let systemPrompt = getSystemPrompt(feature)
  let userPrompt = buildUserPrompt(text, feature, context)

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.1, // Low temperature for consistent results
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  return parseResponse(data.content[0].text, feature)
}

// Utility functions
function getMaxTokensForFeature(feature) {
  const tokenLimits = {
    grammar: 300,
    style: 400,
    suggestions: 200,
    completion: 500,
    summarize: 300,
    medical: 600, // Higher for medical content validation
  }
  return tokenLimits[feature] || 300
}

function getOptimalGeminiModel(feature, textLength) {
  // Use Gemini 1.5 Flash for simple tasks, Gemini 1.5 Pro for complex ones
  if (feature === "medical" || textLength > 2000) {
    return "gemini-1.5-pro"
  }
  return "gemini-1.5-flash" // Most cost-effective for simple tasks
}

function getOptimalAnthropicModel(feature, textLength) {
  // Use Haiku for simple tasks, Sonnet for complex ones, Opus for medical
  if (feature === "medical") return "claude-3-5-sonnet-20241022"
  if (textLength > 2000) return "claude-3-5-sonnet-20241022"
  return "claude-3-5-haiku-20241022" // Most cost-effective for simple tasks
}

function getSystemPrompt(feature) {
  const prompts = {
    grammar: `You are a grammar and spelling expert. Provide corrections in JSON format with minimal tokens. Focus only on actual errors.`,
    style: `You are a writing style expert. Provide style improvements in JSON format. Be concise and actionable.`,
    suggestions: `You are a content strategist. Provide brief, actionable suggestions in JSON format.`,
    completion: `You are a writing assistant. Continue the text naturally and concisely. Return JSON with completion.`,
    summarize: `You are a summarization expert. Create concise summaries in JSON format.`,
    medical: `You are a medical content validator. Check for accuracy, HIPAA compliance, and evidence-based claims. Return detailed analysis in JSON.`,
  }
  return prompts[feature] || prompts.grammar
}

function buildUserPrompt(text, feature, context = "") {
  let prompt = ""

  switch (feature) {
    case "grammar":
      prompt = `Check the following text for grammar and spelling errors. Provide corrections in this JSON format:
{
  "corrections": [{"text": "error", "replacement": "correction", "reason": "explanation", "type": "grammar"}],
  "suggestions": ["general improvement suggestions"],
  "score": {"grammar": 85, "clarity": 90, "engagement": 80}
}

Text: ${text}`
      break

    case "style":
      prompt = `Analyze the writing style of this text and suggest improvements. Format response as JSON:
{
  "corrections": [{"text": "weak phrase", "replacement": "stronger phrase", "reason": "explanation", "type": "style"}],
  "suggestions": ["style improvement suggestions"],
  "score": {"grammar": 85, "clarity": 90, "engagement": 80}
}

Text: ${text}`
      break

    case "suggestions":
      prompt = `Provide content suggestions for this text. Format as JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Text: ${text}`
      break

    case "completion":
      prompt = `Continue this text naturally. Return JSON:
{
  "completion": "your continuation here"
}

Text: ${text}`
      break

    case "summarize":
      prompt = `Summarize this text concisely. Return JSON:
{
  "summary": "your summary here",
  "key_points": ["point 1", "point 2", "point 3"]
}

Text: ${text}`
      break

    default:
      prompt = `Analyze this text and provide feedback. Format as JSON with corrections, suggestions, and scores.

Text: ${text}`
  }

  if (context) {
    prompt = `${prompt}\n\nContext: ${context}`
  }

  return prompt
}

function parseResponse(responseText, feature) {
  try {
    // Try to parse as JSON first
    return JSON.parse(responseText)
  } catch (error) {
    // Fallback to structured response
    return {
      error: "Invalid JSON response",
      raw_response: responseText,
      feature,
    }
  }
}
