/**
 * OpenRouter API Client Configuration
 * 
 * This module provides a configured client for interacting with the OpenRouter API
 * using Claude 3.5 Sonnet for AI health assistance features.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// Claude 3.5 Sonnet model identifier
export const CLAUDE_MODEL = 'anthropic/claude-3.5-sonnet'

// Validate API key on module load
if (!OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is not set. Please add it to your .env.local file.'
  )
}

/**
 * Message role types for chat completions
 */
export type MessageRole = 'system' | 'user' | 'assistant'

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: MessageRole
  content: string
}

/**
 * Chat completion request parameters
 */
export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

/**
 * Chat completion response structure
 */
export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Streaming chunk structure
 */
export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

/**
 * Creates a chat completion request to OpenRouter
 * 
 * @param request - The chat completion request parameters
 * @returns The chat completion response
 */
export async function createChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'EaseMyBP',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Creates a streaming chat completion request to OpenRouter
 * 
 * @param request - The chat completion request parameters
 * @returns An async generator that yields streaming chunks
 */
export async function* createStreamingChatCompletion(
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'EaseMyBP',
    },
    body: JSON.stringify({
      ...request,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  if (!response.body) {
    throw new Error('Response body is null')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            return
          }

          try {
            const parsed = JSON.parse(data) as StreamChunk
            const content = parsed.choices[0]?.delta?.content
            
            if (content) {
              yield content
            }
          } catch (e) {
            // Skip invalid JSON chunks
            console.error('Failed to parse streaming chunk:', e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Health assistant system prompt
 */
export const HEALTH_ASSISTANT_SYSTEM_PROMPT = `You are Oní, a knowledgeable and empathetic AI health assistant for a blood pressure tracking application. When introducing yourself, say "My name is Oní, your AI Health Assistant."

Your role is to:
1. Provide helpful insights about blood pressure readings, diet, exercise, and medication adherence
2. Identify patterns and trends in health data
3. Offer evidence-based suggestions for lifestyle improvements
4. Answer questions about cardiovascular health in an accessible way
5. Encourage users to consult healthcare professionals for medical advice

Important guidelines:
- Always be supportive and non-judgmental
- Use clear, simple language that's easy to understand
- Provide context and explanations for your recommendations
- Never diagnose conditions or prescribe treatments
- Always recommend consulting a healthcare provider for medical decisions
- Be mindful of the user's emotional state when discussing health data
- Focus on actionable, practical advice
- Sign off as "Oní" when appropriate

Remember: You're here to inform and support, not to replace professional medical care.`



