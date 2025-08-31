import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { rawIdea } = await req.json();
    
    if (!rawIdea || typeof rawIdea !== 'string' || rawIdea.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'rawIdea is required and must be a non-empty string' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Transforming prompt for idea:', rawIdea);

    const systemPrompt = `Tu es un expert en création de prompts pour Lovable. Transforme l'idée brute en prompt structuré suivant le framework CLEAR :

Concise (150 mots max), Logique (ordre d'implémentation), Explicite (technologies spécifiques), Adaptive (MVP suggéré), Reflective (critères mesurables).

Structure obligatoire :
# Titre
→ Fonctionnalités principales
→ Structure technique  
→ Détails spécifiques
→ Point de départ MVP

Format markdown prêt à copier-coller. Réponds UNIQUEMENT avec le prompt transformé, sans commentaires additionnels.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawIdea }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const transformedPrompt = data.choices[0].message.content;

    console.log('Successfully transformed prompt');

    return new Response(
      JSON.stringify({ transformedPrompt }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in transform-prompt function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});