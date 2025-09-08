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
    const { title, description, provider = 'openai', model } = await req.json();
    
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

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'title is required and must be a non-empty string' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating better title for:', title, 'using provider:', provider);

    // Build title-focused system prompt
    const systemPrompt = `You are an expert UX copywriter and prompt engineer specializing in creating compelling, descriptive titles for development prompts.

TITLE CREATION PRINCIPLES:
- Maximum 60 characters for optimal readability
- Use action-oriented, specific language 
- Avoid generic terms like "system", "app", "feature", "component"
- Focus on primary functionality and user benefits
- Use active voice and power words
- Be specific about what the prompt achieves

EXAMPLES OF GOOD TRANSFORMATIONS:
❌ "Login System" → ✅ "Secure JWT Authentication with Password Reset"
❌ "Chat Feature" → ✅ "Real-time Chat with File Sharing & Typing Indicators"  
❌ "Dashboard App" → ✅ "Analytics Dashboard with Interactive Charts"
❌ "Payment Component" → ✅ "Stripe Integration with Subscription Management"
❌ "Search Function" → ✅ "Advanced Search with Filters & Auto-complete"
❌ "User Profile" → ✅ "Editable User Profile with Avatar Upload"

Generate 3 alternative titles based on the original title and description. Return them as a JSON array with the best option first.

Respond ONLY with valid JSON in this exact format:
{
  "titles": [
    "Best title option (most specific and compelling)",
    "Alternative title option 2", 
    "Alternative title option 3"
  ]
}`;

    let generatedTitles: string;

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
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nOriginal Title: ${title}\nDescription: ${description || 'No description provided'}`
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
      generatedTitles = data.content[0].text;
    } else {
      // OpenAI provider
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      const openaiModel = model || 'gpt-5-2025-08-07';
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Original Title: ${title}\nDescription: ${description || 'No description provided'}` }
          ],
          max_tokens: 300,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      generatedTitles = data.choices[0].message.content;
    }

    console.log('Successfully generated titles using provider:', provider);

    // Parse the response to ensure it's valid JSON
    let parsedTitles;
    try {
      parsedTitles = JSON.parse(generatedTitles);
    } catch (parseError) {
      console.error('Failed to parse titles response as JSON:', generatedTitles);
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify(parsedTitles), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-better-title function:', error);
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