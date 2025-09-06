import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CursorWebhookPayload {
  agentId: string;
  status: 'CREATING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  repository: string;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  error?: string;
  files?: string[];
  logs?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Cursor webhook received');
    
    const payload: CursorWebhookPayload = await req.json();
    console.log('Webhook payload:', payload);
    
    if (!payload.agentId) {
      return new Response(JSON.stringify({ error: 'Agent ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map Cursor status to our internal status
    const statusMapping: Record<string, string> = {
      'CREATING': 'sent_to_cursor',
      'RUNNING': 'cursor_working',
      'COMPLETED': payload.pullRequestUrl ? 'pr_created' : 'done',
      'FAILED': 'todo', // Reset to todo on failure
      'CANCELLED': 'todo' // Reset to todo on cancellation
    };

    const promptStatus = statusMapping[payload.status] || 'cursor_working';
    
    // Find and update the prompt with this agent ID
    const { data: prompts, error: findError } = await supabase
      .from('prompts')
      .select('*')
      .eq('cursor_agent_id', payload.agentId);

    if (findError) {
      console.error('Error finding prompt:', findError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prompts || prompts.length === 0) {
      console.log('No prompt found for agent ID:', payload.agentId);
      return new Response(JSON.stringify({ message: 'Prompt not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = prompts[0];
    
    // Prepare update data
    const updateData: any = {
      status: promptStatus,
      cursor_agent_status: payload.status,
      updated_at: new Date().toISOString()
    };

    // Add branch info if available
    if (payload.branch && payload.branch !== prompt.cursor_branch_name) {
      updateData.cursor_branch_name = payload.branch;
    }

    // Add PR info if available
    if (payload.pullRequestUrl) {
      updateData.github_pr_url = payload.pullRequestUrl;
    }
    if (payload.pullRequestNumber) {
      updateData.github_pr_number = payload.pullRequestNumber;
    }

    // Update cursor logs with webhook data
    const existingLogs = prompt.cursor_logs || {};
    updateData.cursor_logs = {
      ...existingLogs,
      webhooks: [
        ...(existingLogs.webhooks || []),
        {
          timestamp: new Date().toISOString(),
          status: payload.status,
          data: payload
        }
      ].slice(-10) // Keep only last 10 webhook events
    };

    // If there's an error, add it to workflow metadata
    if (payload.error) {
      updateData.workflow_metadata = {
        ...prompt.workflow_metadata,
        error: payload.error,
        errorAt: new Date().toISOString()
      };
    }

    // Update the prompt
    const { error: updateError } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', prompt.id);

    if (updateError) {
      console.error('Error updating prompt:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update prompt' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Prompt ${prompt.id} updated with Cursor status: ${payload.status} -> ${promptStatus}`);

    // Trigger task automation for status transitions
    try {
      const automationResult = await supabase.functions.invoke('workflow-automation', {
        body: {
          workspaceId: prompt.workspace_id,
          action: 'task_automation',
          entityId: prompt.id,
          entityType: 'prompt'
        }
      });
      
      if (automationResult.error) {
        console.error('Task automation failed:', automationResult.error);
      } else {
        console.log('Task automation triggered successfully:', automationResult.data);
      }
    } catch (automationError) {
      console.error('Error triggering task automation:', automationError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cursor webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});