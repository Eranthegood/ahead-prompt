import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Debug console analysis request received');
    
    const { consoleErrors, workspaceId } = await req.json();
    
    if (!consoleErrors || !consoleErrors.trim()) {
      return new Response(JSON.stringify({ error: 'Console errors are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing console errors with OpenAI...');

    const systemPrompt = `You are a web debugging expert. Analyze these console errors and for each error provide:
- Type (React/API/Supabase/CORS/Build/Network/etc)
- Severity (Critical/Warning/Info)
- Exact cause
- Solution with precise code
- File where to apply the fix

Format your response as JSON with this structure:
{
  "summary": {
    "totalErrors": number,
    "criticalCount": number,
    "warningCount": number,
    "infoCount": number
  },
  "errors": [
    {
      "id": "unique-id",
      "type": "React|API|Supabase|CORS|Build|Network|Other",
      "severity": "Critical|Warning|Info",
      "title": "Short error title",
      "description": "Description of the exact cause",
      "solution": "Detailed solution with code",
      "codeExample": "Code example if applicable",
      "file": "File where to apply the fix",
      "originalError": "Original console error"
    }
  ]
}

Prioritize critical errors first. Be precise and actionable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze these console errors:\n\n${consoleErrors}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return new Response(JSON.stringify({ error: 'Failed to analyze errors' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis completed successfully');

    // Parse the JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Fallback: return raw analysis if JSON parsing fails
      parsedAnalysis = {
        summary: { totalErrors: 1, criticalCount: 1, warningCount: 0, infoCount: 0 },
        errors: [{
          id: 'fallback-1',
          type: 'Other',
          severity: 'Critical',
          title: 'Analysis Error',
          description: 'Failed to parse analysis',
          solution: analysis,
          codeExample: '',
          file: 'Unknown',
          originalError: consoleErrors
        }]
      };
    }

    // Optionally save debug session to database
    if (workspaceId) {
      try {
        await supabase.from('prompts').insert({
          workspace_id: workspaceId,
          title: `🐛 Debug Session - ${parsedAnalysis.summary.totalErrors} errors`,
          content: `Console errors analyzed:\n\n${consoleErrors.substring(0, 500)}...`,
          status: 'done',
          is_debug_session: true
        });
      } catch (dbError) {
        console.error('Failed to save debug session:', dbError);
        // Don't fail the request if DB save fails
      }
    }

    return new Response(JSON.stringify(parsedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in debug-console function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});