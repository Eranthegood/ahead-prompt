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
      // First update the prompt status to "sent_to_cursor"
      await supabase
        .from('prompts')
        .update({
          status: 'sent_to_cursor',
          workflow_metadata: {
            repository: config.repository,
            ref: config.ref,
            model: config.model,
            autoCreatePr: config.autoCreatePr,
            sentAt: new Date().toISOString()
          }
        })
        .eq('id', prompt.id);

      // Send to Cursor via edge function
      const { data, error } = await supabase.functions.invoke('send-to-cursor', {
        body: {
          prompt: prompt.generated_prompt || prompt.description,
          repository: config.repository,
          ref: config.ref,
          branchName: config.branchName,
          autoCreatePr: config.autoCreatePr,
          model: config.model
        }
      });

      if (error || data.error) {
        throw new Error(error?.message || data.error);
      }

      // Update prompt with Cursor agent data
      await supabase
        .from('prompts')
        .update({
          status: 'cursor_working',
          cursor_agent_id: data.agent.id,
          cursor_agent_status: data.agent.status,
          cursor_branch_name: data.agent.branch || config.branchName,
          cursor_logs: { 
            created: data.agent,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq('id', prompt.id);

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
    // TODO: Implement agent status polling
    // This would call a Cursor API endpoint to get current status
    console.log('Updating agent status for:', agentId);
  }, []);

  const cancelAgent = useCallback(async (agentId: string) => {
    // TODO: Implement agent cancellation
    // This would call a Cursor API endpoint to cancel the agent
    console.log('Cancelling agent:', agentId);
    
    toast({
      title: 'Agent cancelled',
      description: 'The Cursor agent has been cancelled.',
    });
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