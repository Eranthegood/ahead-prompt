import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getStatusDisplayInfo } from '@/types/cursor';
import type { Database } from '@/integrations/supabase/types';

type PromptRow = Database['public']['Tables']['prompts']['Row'];

export interface PromptPR extends PromptRow {
  // Extend with any additional computed properties if needed
}

export interface UsePromptPRsReturn {
  promptsWithPRs: PromptPR[];
  isLoading: boolean;
  error: string | null;
  refreshPrompts: () => Promise<void>;
  mergePR: (promptId: string, mergeMethod: 'merge' | 'squash' | 'rebase', commitTitle?: string, commitMessage?: string) => Promise<boolean>;
}

export function usePromptPRs(workspaceId: string): UsePromptPRsReturn {
  const [promptsWithPRs, setPromptsWithPRs] = useState<PromptPR[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPromptsWithPRs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .not('github_pr_url', 'is', null)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPromptsWithPRs(data || []);
    } catch (err: any) {
      console.error('Error fetching prompts with PRs:', err);
      setError(err.message || 'Failed to load prompts with PRs');
    } finally {
      setIsLoading(false);
    }
  };

  const mergePR = async (
    promptId: string, 
    mergeMethod: 'merge' | 'squash' | 'rebase',
    commitTitle?: string,
    commitMessage?: string
  ): Promise<boolean> => {
    const prompt = promptsWithPRs.find(p => p.id === promptId);
    if (!prompt || !prompt.github_pr_url || !prompt.github_pr_number) {
      toast({
        title: "Error",
        description: "No valid PR found for this prompt",
        variant: "destructive",
      });
      return false;
    }

    const repository = (prompt.workflow_metadata as any)?.repository;
    if (!repository) {
      toast({
        title: "Error", 
        description: "Repository information not found",
        variant: "destructive",
      });
      return false;
    }

    const [owner, repo] = repository.split('/');

    try {
      const { data, error } = await supabase.functions.invoke('github-pr-operations', {
        body: {
          action: 'merge',
          owner,
          repo,
          pull_number: prompt.github_pr_number,
          merge_method: mergeMethod,
          commit_title: commitTitle,
          commit_message: commitMessage,
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to merge PR');
      }

      // Update prompt status to merged
      await supabase
        .from('prompts')
        .update({ 
          status: 'pr_merged',
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);

      toast({
        title: "Success",
        description: `PR #${prompt.github_pr_number} merged successfully`,
      });

      // Refresh the prompts list
      await fetchPromptsWithPRs();
      
      return true;
    } catch (err: any) {
      console.error('Error merging PR:', err);
      toast({
        title: "Error merging PR",
        description: err.message || 'Failed to merge pull request',
        variant: "destructive",
      });
      return false;
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('prompt-prs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prompts',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('Prompt realtime update:', payload);
          
          // Only handle prompts with PRs
          if (payload.new && (payload.new as any).github_pr_url) {
            fetchPromptsWithPRs();
          } else if (payload.old && (payload.old as any).github_pr_url) {
            // Handle deletions or PR URL removals
            fetchPromptsWithPRs();
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchPromptsWithPRs();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  return {
    promptsWithPRs,
    isLoading,
    error,
    refreshPrompts: fetchPromptsWithPRs,
    mergePR,
  };
}