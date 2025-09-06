import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetAgentStatusRequest {
  agentId: string;
}

interface CursorAgentResponse {
  id: string;
  status: string;
  repository?: string;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  error?: string;
  createdAt?: string;
  completedAt?: string;
  filesModified?: string[];
  logs?: Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error';
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CURSOR_API_KEY = Deno.env.get('CURSOR_API_KEY');
    if (!CURSOR_API_KEY) {
      console.error('CURSOR_API_KEY not configured');
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

    console.log('Fetching agent status from Cursor API for agent:', agentId);

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
      console.error('Cursor API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: 'Agent not found',
          agentId 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Unauthorized - Invalid Cursor API key',
          details: errorText
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch agent status from Cursor API',
        status: response.status,
        details: errorText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const agentData: CursorAgentResponse = await response.json();
    console.log('Agent status retrieved successfully:', {
      id: agentData.id,
      status: agentData.status,
      repository: agentData.repository,
      branch: agentData.branch
    });

    // Update database with latest status if we have Supabase access
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Map Cursor status to internal status
        let internalStatus = 'sent_to_cursor';
        switch (agentData.status.toUpperCase()) {
          case 'PENDING':
          case 'QUEUED':
            internalStatus = 'sent_to_cursor';
            break;
          case 'RUNNING':
            internalStatus = 'cursor_working';
            break;
          case 'COMPLETED':
            internalStatus = agentData.pullRequestUrl ? 'pr_created' : 'done';
            break;
          case 'FAILED':
          case 'CANCELLED':
          case 'TIMEOUT':
            internalStatus = 'error';
            break;
        }

        // Update prompt with latest agent data
        const { error: updateError } = await supabase
          .from('prompts')
          .update({
            status: internalStatus,
            cursor_agent_status: agentData.status,
            cursor_branch_name: agentData.branch,
            github_pr_url: agentData.pullRequestUrl,
            github_pr_number: agentData.pullRequestNumber,
            cursor_logs: {
              lastStatusCheck: new Date().toISOString(),
              agentData: agentData,
              logs: agentData.logs || []
            },
            updated_at: new Date().toISOString()
          })
          .eq('cursor_agent_id', agentId);

        if (updateError) {
          console.error('Failed to update prompt in database:', updateError);
        } else {
          console.log('Successfully updated prompt status in database');
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Don't fail the entire request if DB update fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      agent: agentData 
    }), {
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