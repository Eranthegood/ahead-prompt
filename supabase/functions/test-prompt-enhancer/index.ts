import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface TestPromptRequest {
  enhancerVersionId: string;
  testInput: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  workspaceId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { 
      enhancerVersionId, 
      testInput, 
      model = 'gpt-4o-mini', 
      maxTokens = 1000, 
      temperature = 0.7,
      workspaceId 
    }: TestPromptRequest = await req.json();

    console.log('Testing prompt enhancer:', { enhancerVersionId, model });

    // Get the enhancer version
    const { data: version, error: versionError } = await supabase
      .from('prompt_enhancer_versions')
      .select('*')
      .eq('id', enhancerVersionId)
      .single();

    if (versionError || !version) {
      throw new Error('Enhancer version not found');
    }

    // Create test run record
    const { data: testRun, error: testRunError } = await supabase
      .from('prompt_test_runs')
      .insert({
        enhancer_version_id: enhancerVersionId,
        test_input: testInput,
        model_used: model,
        max_tokens: maxTokens,
        temperature,
        workspace_id: workspaceId,
        status: 'running'
      })
      .select()
      .single();

    if (testRunError || !testRun) {
      throw new Error('Failed to create test run record');
    }

    const startTime = Date.now();

    // Prepare the prompt using the enhancer template
    const systemMessage = version.system_message;
    const promptTemplate = version.prompt_template.replace('{raw_idea}', testInput).replace('{knowledge_context}', '');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: promptTemplate }
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorData}`);
    }

    const result = await openAIResponse.json();
    const testOutput = result.choices[0]?.message?.content || '';
    const executionTime = Date.now() - startTime;

    // Update test run with results
    const { error: updateError } = await supabase
      .from('prompt_test_runs')
      .update({
        test_output: testOutput,
        status: 'completed',
        execution_time: executionTime
      })
      .eq('id', testRun.id);

    if (updateError) {
      console.error('Failed to update test run:', updateError);
    }

    console.log('Prompt test completed successfully');

    return new Response(JSON.stringify({
      testRunId: testRun.id,
      testOutput,
      executionTime,
      status: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in test-prompt-enhancer function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});