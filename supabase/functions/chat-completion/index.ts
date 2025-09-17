import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

interface ChatbotModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude';
  modelId: string;
  tier: 'free' | 'basic' | 'pro';
  description: string;
  maxTokens: number;
}

interface ChatRequest {
  message: ChatMessage;
  model: ChatbotModel;
  context?: ChatMessage[];
  sessionId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { message, model, context = [], sessionId } = await req.json() as ChatRequest

    if (!message || !model) {
      throw new Error('Message and model are required')
    }

    // Validate user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid authentication')
    }

    // Verify user's subscription tier allows access to this model
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = profile?.subscription_tier || 'free'
    
    // Check if user has access to this model
    const tierHierarchy = {
      free: ['free'],
      basic: ['free', 'basic'],
      pro: ['free', 'basic', 'pro']
    }
    
    if (!tierHierarchy[userTier as keyof typeof tierHierarchy]?.includes(model.tier)) {
      throw new Error(`Access denied: ${model.name} requires ${model.tier} subscription or higher`)
    }

    let assistantResponse: string
    let usage: any = {}

    if (model.provider === 'openai') {
      assistantResponse = await callOpenAI(message, model, context)
    } else if (model.provider === 'claude') {
      assistantResponse = await callClaude(message, model, context)
    } else {
      throw new Error(`Unsupported provider: ${model.provider}`)
    }

    // Create assistant message
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date(),
      model: model.id
    }

    // If sessionId is provided, save messages to database
    let finalSessionId = sessionId
    if (!finalSessionId) {
      // Create new session
      const sessionTitle = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .insert([{
          user_id: user.id,
          title: sessionTitle,
          model_id: model.id
        }])
        .select()
        .single()

      if (sessionError) {
        throw sessionError
      }
      finalSessionId = newSession.id
    }

    // Save both messages to database
    const messagesToSave = [
      {
        id: message.id,
        session_id: finalSessionId,
        role: message.role,
        content: message.content,
        model_id: message.model || model.id,
        created_at: message.timestamp
      },
      {
        id: assistantMessage.id,
        session_id: finalSessionId,
        role: assistantMessage.role,
        content: assistantMessage.content,
        model_id: assistantMessage.model,
        created_at: assistantMessage.timestamp
      }
    ]

    const { error: messagesError } = await supabaseClient
      .from('chat_messages')
      .insert(messagesToSave)

    if (messagesError) {
      console.error('Error saving messages:', messagesError)
      // Don't throw error here, just log it
    }

    // Update session timestamp
    await supabaseClient
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', finalSessionId)

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        sessionId: finalSessionId,
        usage
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Chat completion error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function callOpenAI(message: ChatMessage, model: ChatbotModel, context: ChatMessage[]): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  // Build messages array for OpenAI
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
    },
    ...context.slice(-10).map(msg => ({ // Limit context to last 10 messages
      role: msg.role,
      content: msg.content
    })),
    {
      role: message.role,
      content: message.content
    }
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.modelId,
      messages: messages,
      max_tokens: model.maxTokens,
      temperature: 0.7,
      stream: false
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

async function callClaude(message: ChatMessage, model: ChatbotModel, context: ChatMessage[]): Promise<string> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured')
  }

  // Build messages array for Claude
  const messages = [
    ...context.slice(-10).map(msg => ({ // Limit context to last 10 messages
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    {
      role: 'user',
      content: message.content
    }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicApiKey}`,
      'Content-Type': 'application/json',
      'x-api-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model.modelId,
      max_tokens: model.maxTokens,
      messages: messages,
      system: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.content[0]?.text || 'No response generated'
}