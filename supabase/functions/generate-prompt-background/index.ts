import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  promptId: string;
  rawText: string;
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

    if (!promptId || !rawText) {
      return new Response(
        JSON.stringify({ error: 'Missing promptId or rawText' }),
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
            content: rawText
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