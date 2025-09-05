import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetAgentStatusRequest {
  agentId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CURSOR_API_KEY = Deno.env.get('CURSOR_API_KEY');
    if (!CURSOR_API_KEY) {
      return new Response(JSON.stringify({ error: 'CURSOR_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Get Cursor agent status request received');
    
    const { agentId }: GetAgentStatusRequest = await req.json();
    
    if (!agentId) {
      return new Response(JSON.stringify({ error: 'Agent ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching agent status from Cursor API:', agentId);

    // Get agent status from Cursor API
    const response = await fetch(`https://api.cursor.com/v0/agents/${agentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CURSOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cursor API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cursor API error:', errorText);
      
      if (response.status === 404) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch agent status',
        details: errorText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const agentData = await response.json();
    console.log('Agent status retrieved:', agentData);

    return new Response(JSON.stringify({ agent: agentData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching agent status:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});