import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

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
    const { promptId, content, knowledgeContext, provider = 'openai', model = 'gpt-4o' } = await req.json();
    
    if (!promptId || !content) {
      return new Response(
        JSON.stringify({ error: 'promptId and content are required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Starting background generation for prompt:', promptId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Background task for prompt generation
    const backgroundGeneration = async () => {
      try {
        // Call transform-prompt function
        const transformResponse = await fetch(`${supabaseUrl}/functions/v1/transform-prompt`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rawIdea: content,
            knowledgeContext,
            provider,
            model
          }),
        });

        if (!transformResponse.ok) {
          throw new Error(`Transform failed: ${transformResponse.statusText}`);
        }

        const { transformedPrompt } = await transformResponse.json();

        if (!transformedPrompt) {
          throw new Error('No transformed prompt returned');
        }

        // Update prompt with generated content and change status to todo
        const { error: updateError } = await supabase
          .from('prompts')
          .update({
            generated_prompt: transformedPrompt,
            generated_at: new Date().toISOString(),
            status: 'todo',
            updated_at: new Date().toISOString()
          })
          .eq('id', promptId);

        if (updateError) {
          throw updateError;
        }

        console.log('Successfully generated prompt in background for:', promptId);

      } catch (error) {
        console.error('Background generation failed for prompt:', promptId, error);
        
        // Revert status to todo on failure
        await supabase
          .from('prompts')
          .update({
            status: 'todo',
            updated_at: new Date().toISOString()
          })
          .eq('id', promptId);
      }
    };

    // Start background task without waiting
    EdgeRuntime.waitUntil(backgroundGeneration());

    // Return immediate response
    return new Response(
      JSON.stringify({ message: 'Background generation started', promptId }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-prompt-background function:', error);
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