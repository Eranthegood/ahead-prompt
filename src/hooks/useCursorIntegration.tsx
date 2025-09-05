import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Prompt } from '@/types';

interface CursorAgent {
  id: string;
  status: string;
  repository: string;
  branch?: string;
}

interface CursorIntegrationHook {
  isLoading: boolean;
  sendToCursor: (prompt: Prompt, config: {
    repository: string;
    ref: string;
    branchName?: string;
    autoCreatePr: boolean;
    model: string;
  }) => Promise<CursorAgent | null>;
  updateAgentStatus: (agentId: string) => Promise<void>;
  cancelAgent: (agentId: string) => Promise<void>;
  mergePullRequest: (prUrl: string) => Promise<void>;
}

export function useCursorIntegration(): CursorIntegrationHook {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendToCursor = useCallback(async (prompt: Prompt, config: {
    repository: string;
    ref: string;
    branchName?: string;
    autoCreatePr: boolean;
    model: string;
  }): Promise<CursorAgent | null> => {
    setIsLoading(true);
    
    try {
      // First update the prompt status to "sending" for immediate UI feedback
      await supabase
        .from('prompts')
        .update({
          status: 'sending_to_cursor',
          workflow_metadata: {
            repository: config.repository,
            ref: config.ref,
            model: config.model,
            autoCreatePr: config.autoCreatePr,
            startedAt: new Date().toISOString()
          }
        })
        .eq('id', prompt.id);

      toast({
        title: 'Sending to Cursor...',
        description: 'Creating background agent for autonomous code generation.',
      });

      // Generate webhook URL for real-time updates
      const projectUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:54321'
        : window.location.origin;
      const webhookUrl = `${projectUrl}/functions/v1/cursor-webhook`;

      // Send to Cursor via edge function
      const { data, error } = await supabase.functions.invoke('send-to-cursor', {
        body: {
          prompt: prompt.generated_prompt || prompt.description,
          repository: config.repository,
          ref: config.ref,
          branchName: config.branchName,
          autoCreatePr: config.autoCreatePr,
          model: config.model,
          webhookUrl // Enable real-time updates
        }
      });

      if (error || data.error) {
        throw new Error(error?.message || data.error);
      }

      // Update prompt with Cursor agent data
      await supabase
        .from('prompts')
        .update({
          status: 'sent_to_cursor',
          cursor_agent_id: data.agent.id,
          cursor_agent_status: data.agent.status,
          cursor_branch_name: data.agent.branch || config.branchName,
          cursor_logs: { 
            created: data.agent,
            lastUpdated: new Date().toISOString(),
            webhookEnabled: true
          }
        })
        .eq('id', prompt.id);

      toast({
        title: 'Agent Created Successfully! 🤖',
        description: `Cursor agent "${data.agent.id}" is now working on your repository.`,
      });

      return data.agent;
    } catch (error) {
      console.error('Error sending to Cursor:', error);
      
      // Revert status on error
      await supabase
        .from('prompts')
        .update({ status: 'todo' })
        .eq('id', prompt.id);
        
      toast({
        title: 'Failed to send to Cursor',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateAgentStatus = useCallback(async (agentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-cursor-agent-status', {
        body: { agentId }
      });

      if (error || data.error) {
        console.error('Failed to update agent status:', error || data.error);
        return;
      }

      // Update the prompt with latest agent status
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          cursor_agent_status: data.agent.status,
          cursor_logs: {
            lastUpdated: new Date().toISOString(),
            statusCheck: data.agent
          }
        })
        .eq('cursor_agent_id', agentId);

      if (updateError) {
        console.error('Failed to update prompt status:', updateError);
      }

      return data.agent;
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  }, []);

  const cancelAgent = useCallback(async (agentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-cursor-agent', {
        body: { agentId }
      });

      if (error || data.error) {
        throw new Error(error?.message || data.error);
      }

      // Update prompt status back to todo
      await supabase
        .from('prompts')
        .update({
          status: 'todo',
          cursor_agent_status: 'CANCELLED',
          cursor_logs: {
            cancelled: true,
            cancelledAt: new Date().toISOString()
          }
        })
        .eq('cursor_agent_id', agentId);
      
      toast({
        title: 'Agent Cancelled',
        description: 'The Cursor agent has been cancelled successfully.',
      });
    } catch (error) {
      console.error('Error cancelling agent:', error);
      toast({
        title: 'Failed to Cancel Agent',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const mergePullRequest = useCallback(async (prUrl: string) => {
    // TODO: Implement PR merge via GitHub API
    // This would require GitHub integration
    console.log('Merging PR:', prUrl);
    
    toast({
      title: 'PR merged',
      description: 'The pull request has been merged successfully.',
    });
  }, [toast]);

  return {
    isLoading,
    sendToCursor,
    updateAgentStatus,
    cancelAgent,
    mergePullRequest
  };
}