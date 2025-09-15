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
    const { apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'API key is required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Test the Anthropic API key with a simple request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }),
    });

    if (response.ok) {
      // API key is valid, return success with available models
      const models = [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
        { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1' }
      ];

      return new Response(JSON.stringify({
        isValid: true,
        user: {
          username: 'Claude User',
          email: null
        },
        models
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Invalid API key';
      
      console.error('Claude API validation failed:', errorData);
      
      return new Response(JSON.stringify({
        isValid: false,
        error: errorMessage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
  } catch (error) {
    console.error('Error validating Claude token:', error);
    
    return new Response(JSON.stringify({
      isValid: false,
      error: 'Failed to validate API key'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});