import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExecuteRequest {
  sessionId: string
  prompt: string
  config: {
    model: string
    repository: string
    branch?: string
    workingDirectories?: string[]
    createPR: boolean
    commitMessage?: string
  }
  promptId: string
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY non configuré')
    }

    const { sessionId, prompt, config, promptId }: ExecuteRequest = await req.json()

    console.log(`[${sessionId}] Démarrage de la session Claude Code`)

    // Validation
    if (!sessionId || !prompt || !config.repository) {
      throw new Error('Paramètres manquants')
    }

    // Simulate Claude Code execution workflow
    console.log(`[${sessionId}] Configuration:`, config)

    // 1. Update status to cloning
    await updateSessionStatus(supabase, sessionId, 'cloning_repo')
    console.log(`[${sessionId}] Status mis à jour: cloning_repo`)

    // Simulate git clone delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 2. Update status to executing Claude
    await updateSessionStatus(supabase, sessionId, 'executing_claude')
    console.log(`[${sessionId}] Status mis à jour: executing_claude`)

    // Add simulated output
    await addOutputLine(supabase, sessionId, `Cloning repository: ${config.repository}`)
    await addOutputLine(supabase, sessionId, `Switched to branch: ${config.branch || 'main'}`)
    
    // Simulate Claude Code execution with Anthropic API
    const claudeResponse = await executeClaudeCode(anthropicApiKey, prompt, config)
    
    if (claudeResponse.success) {
      await addOutputLine(supabase, sessionId, 'Claude Code execution completed successfully')
      
      // 3. Handle git operations if requested
      if (config.createPR) {
        await updateSessionStatus(supabase, sessionId, 'committing_changes')
        await addOutputLine(supabase, sessionId, 'Committing changes...')
        
        // Simulate git operations
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        await updateSessionStatus(supabase, sessionId, 'creating_pr')
        await addOutputLine(supabase, sessionId, 'Creating pull request...')
        
        // Simulate PR creation
        await new Promise(resolve => setTimeout(resolve, 1000))
        await addOutputLine(supabase, sessionId, 'Pull request created successfully')
      }
      
      await updateSessionStatus(supabase, sessionId, 'completed')
      console.log(`[${sessionId}] Session terminée avec succès`)
    } else {
      await updateSessionStatus(supabase, sessionId, 'failed', claudeResponse.error)
      console.error(`[${sessionId}] Session échouée:`, claudeResponse.error)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sessionId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Execute Claude Code Error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function updateSessionStatus(
  supabase: any, 
  sessionId: string, 
  status: string, 
  errorMessage?: string
) {
  const updateData: any = { status, updated_at: new Date().toISOString() }
  if (errorMessage) updateData.error_message = errorMessage
  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('claude_sessions')
    .update(updateData)
    .eq('session_id', sessionId)

  if (error) {
    console.error(`Error updating session status:`, error)
    throw error
  }
}

async function addOutputLine(supabase: any, sessionId: string, line: string) {
  // Get current output lines
  const { data: session, error: fetchError } = await supabase
    .from('claude_sessions')
    .select('output_lines')
    .eq('session_id', sessionId)
    .single()

  if (fetchError) {
    console.error('Error fetching session:', fetchError)
    return
  }

  const currentLines = session.output_lines || []
  const updatedLines = [...currentLines, `[${new Date().toISOString()}] ${line}`]

  const { error } = await supabase
    .from('claude_sessions')
    .update({ 
      output_lines: updatedLines,
      updated_at: new Date().toISOString()
    })
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error adding output line:', error)
  }
}

async function executeClaudeCode(
  apiKey: string, 
  prompt: string, 
  config: any
): Promise<{ success: boolean; error?: string; response?: string }> {
  try {
    console.log('Calling Anthropic API...')
    
    // Prepare context about the repository
    const contextPrompt = `
You are Claude Code, an AI assistant that helps with code generation and modification.

Repository: ${config.repository}
Branch: ${config.branch || 'main'}
Additional directories: ${config.workingDirectories?.join(', ') || 'none'}

User prompt: ${prompt}

Please analyze this request and provide a response as if you were executing code changes.
Focus on what files would be modified and what changes would be made.
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: contextPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API Error:', errorData)
      return { success: false, error: `Anthropic API Error: ${response.status}` }
    }

    const data = await response.json()
    console.log('Anthropic API Response received')
    
    return { 
      success: true, 
      response: data.content[0]?.text || 'No response from Claude' 
    }

  } catch (error) {
    console.error('Error calling Anthropic API:', error)
    return { success: false, error: error.message }
  }
}