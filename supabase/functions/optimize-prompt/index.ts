import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { promptId, workspaceId } = await req.json();

    console.log('Starting prompt optimization for:', { promptId, workspaceId });

    // Get the prompt to optimize
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (promptError) {
      console.error('Error fetching prompt:', promptError);
      throw new Error('Prompt not found');
    }

    // Find or create the prompt optimizer agent
    let { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('agent_type', 'prompt_optimizer')
      .eq('is_active', true)
      .single();

    if (agentError && agentError.code === 'PGRST116') {
      // Create the agent if it doesn't exist
      const { data: newAgent, error: createError } = await supabase
        .from('ai_agents')
        .insert({
          workspace_id: workspaceId,
          agent_type: 'prompt_optimizer',
          name: 'Prompt Optimizer',
          description: 'Automatically optimizes prompts for better clarity and effectiveness',
          config: {},
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating agent:', createError);
        throw new Error('Failed to create optimizer agent');
      }
      agent = newAgent;
    } else if (agentError) {
      console.error('Error fetching agent:', agentError);
      throw new Error('Failed to fetch optimizer agent');
    }

    // Prepare the optimization request
    const systemPrompt = `You are an expert prompt engineer. Your task is to analyze and improve prompts for AI development workflows.

Analyze the following prompt and provide specific, actionable improvements:

1. **Clarity**: Make the instructions clearer and more specific
2. **Context**: Add necessary context that might be missing
3. **Structure**: Improve the logical flow and organization
4. **Specificity**: Make vague requirements more precise
5. **Completeness**: Identify missing elements that would improve results

Original Prompt:
Title: ${prompt.title}
Description: ${prompt.description || 'No description provided'}

Please respond with a JSON object containing:
{
  "improvements": {
    "title": "improved title if needed",
    "description": "improved description with specific enhancements",
    "suggestions": [
      "specific suggestion 1",
      "specific suggestion 2"
    ],
    "clarity_score": 8.5,
    "completeness_score": 7.0
  }
}`;

    // Call OpenAI API
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to optimize prompt with AI');
    }

    const aiResponse = await response.json();
    
    let optimizationResult;
    try {
      optimizationResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', aiResponse.choices[0].message.content);
      throw new Error('Invalid response format from AI');
    }

    console.log('Optimization completed:', optimizationResult);

    // Update the prompt with improvements
    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        title: optimizationResult.improvements.title || prompt.title,
        description: optimizationResult.improvements.description || prompt.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId);

    if (updateError) {
      console.error('Error updating prompt:', updateError);
      throw new Error('Failed to update prompt');
    }

    return new Response(JSON.stringify({
      success: true,
      agentId: agent.id,
      improvements: optimizationResult.improvements
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-prompt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});