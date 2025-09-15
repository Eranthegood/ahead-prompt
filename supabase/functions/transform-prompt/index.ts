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
    const { rawIdea, knowledgeContext, provider = 'openai', model } = await req.json();
    
    // Validate required API keys based on provider
    if (provider === 'openai') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
      }
    } else if (provider === 'claude') {
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not set');
      }
    }

    if (!rawIdea || typeof rawIdea !== 'string' || rawIdea.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'rawIdea is required and must be a non-empty string' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Transforming prompt for idea:', rawIdea, 'using provider:', provider);
    if (knowledgeContext) {
      console.log('Including knowledge context:', knowledgeContext.length, 'items');
    }

    // Build context-aware system prompt
    let systemPrompt = `You are an expert in creating prompts for Lovable. Transform the raw idea into a structured prompt following the CLEAR framework:

Concise (150 words max), Logical (implementation order), Explicit (specific technologies), Adaptive (suggested MVP), Reflective (measurable criteria).

Required structure:
# Title
→ Main features
→ Technical structure  
→ Specific details
→ MVP starting point

Markdown format ready to copy-paste. Respond ONLY with the transformed prompt, no additional comments.`;

    // Add knowledge context if provided
    if (knowledgeContext && Array.isArray(knowledgeContext) && knowledgeContext.length > 0) {
      systemPrompt += `\n\nAVAILABLE PROJECT CONTEXT (integrate in response if relevant):`;
      knowledgeContext.forEach((item, index) => {
        systemPrompt += `\n\n${index + 1}. ${item.title} (${item.category}):\n${item.content}`;
        if (item.tags && item.tags.length > 0) {
          systemPrompt += `\nTags: ${item.tags.join(', ')}`;
        }
      });
      systemPrompt += `\n\nUse this information to enrich and personalize the prompt according to the project context.`;
    }

    let transformedPrompt: string;

    if (provider === 'claude') {
      const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
      const claudeModel = model || 'claude-sonnet-4-20250514';
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: claudeModel,
          max_tokens: 800,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser request: ${rawIdea}`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Claude API error:', errorData);
        throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      transformedPrompt = data.content[0].text;
    } else {
      // OpenAI provider
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      const openaiModel = model || 'gpt-4o';
      
      // Check if it's a newer model that requires different parameters
      const isNewerModel = openaiModel.includes('gpt-5') || openaiModel.includes('gpt-4.1') || openaiModel.includes('o3') || openaiModel.includes('o4');
      
      const requestBody: any = {
        model: openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawIdea }
        ],
      };

      // Use appropriate token parameter based on model
      if (isNewerModel) {
        requestBody.max_completion_tokens = 800;
        // Newer models don't support temperature parameter
      } else {
        requestBody.max_tokens = 800;
        requestBody.temperature = 0.7;
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      transformedPrompt = data.choices[0].message.content;
    }

    console.log('Successfully transformed prompt using provider:', provider);

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