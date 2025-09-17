import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    auth: {
      persistSession: false,
    },
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, test } = await req.json();

    // Get user from request for security and per-user secret lookup
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Authorization header required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Invalid user token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    let actualApiKey = apiKey;
    
    // If no API key provided or this is a test call, try to get stored token from Supabase
    if ((test && !apiKey) || !apiKey) {
      const secretKey = `CLAUDE_TOKEN_${user.id}`;
      const { data: secretRow, error: secretError } = await supabase
        .from('secrets')
        .select('secret_value')
        .eq('user_id', user.id)
        .eq('secret_name', secretKey)
        .maybeSingle();

      if (secretError) {
        console.error('Error fetching stored Claude token:', secretError);
      }

      if (!actualApiKey && secretRow?.secret_value) {
        actualApiKey = secretRow.secret_value as string;
      }
    }

    if (!actualApiKey) {
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'API key is required or not configured for this user' 
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
        'x-api-key': actualApiKey,
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