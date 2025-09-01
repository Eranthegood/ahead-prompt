import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  promptId: string;
  rawText?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { promptId, rawText }: RequestBody = await req.json()

    if (!promptId) {
      return new Response(
        JSON.stringify({ error: 'Missing promptId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Strip HTML and normalize text
    const stripHtmlAndNormalize = (html: string): string => {
      return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
        .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Replace other HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
    }

    let finalRawText = rawText

    // If rawText is empty or missing, fetch from database
    if (!finalRawText || stripHtmlAndNormalize(finalRawText).length === 0) {
      console.log(`No rawText provided for prompt ${promptId}, fetching from database`)
      
      const { data: promptData, error: fetchError } = await supabase
        .from('prompts')
        .select('title, description')
        .eq('id', promptId)
        .single()
        
      if (fetchError || !promptData) {
        console.error('Failed to fetch prompt data:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch prompt data' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Build rawText from description or title
      const cleanDescription = promptData.description ? stripHtmlAndNormalize(promptData.description) : ''
      finalRawText = cleanDescription || promptData.title || ''
      
      console.log(`Fallback rawText for prompt ${promptId}: "${finalRawText}" (length: ${finalRawText.length})`)
    } else {
      // Clean the provided rawText
      finalRawText = stripHtmlAndNormalize(finalRawText)
      console.log(`Using provided rawText for prompt ${promptId}: length ${finalRawText.length}`)
    }

    // Final validation
    if (!finalRawText || finalRawText.length < 3) {
      console.log(`Insufficient content for prompt ${promptId}: "${finalRawText}"`)
      return new Response(
        JSON.stringify({ error: 'Insufficient content for AI generation. Please add more context to your prompt.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Transform the prompt using OpenAI (CLEAR framework)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en création de prompts pour Lovable. Transforme l'idée brute en prompt structuré suivant le framework CLEAR :

Concise (150 mots max), Logique (ordre d'implémentation), Explicite (technologies spécifiques), Adaptive (MVP suggéré), Reflective (critères mesurables).

Structure obligatoire :
# Titre
→ Fonctionnalités principales
→ Structure technique  
→ Détails spécifiques
→ Point de départ MVP

Format markdown prêt à copier-coller. Réponds UNIQUEMENT avec le prompt transformé, sans commentaires additionnels.`
          },
          {
            role: 'user',
            content: finalRawText
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const transformedPrompt = openaiData.choices[0]?.message?.content

    if (!transformedPrompt) {
      throw new Error('No content received from OpenAI')
    }

    // Update the prompt in the database
    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        generated_prompt: transformedPrompt,
        generated_at: new Date().toISOString(),
      })
      .eq('id', promptId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transformedPrompt 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-prompt-background:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})