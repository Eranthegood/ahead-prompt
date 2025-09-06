import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  draft: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merged: boolean;
  merge_commit_sha: string | null;
  head: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface MergeRequest {
  owner: string;
  repo: string;
  pull_number: number;
  commit_title?: string;
  commit_message?: string;
  merge_method: 'merge' | 'squash' | 'rebase';
}

export function useGitHubPRs() {
  const [prs, setPRs] = useState<GitHubPR[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPRs = useCallback(async (owner: string, repo: string) => {
    if (!owner || !repo) {
      setError('Owner and repository name are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await supabase.functions.invoke('github-pr-operations/list-prs', {
        body: { owner, repo }
      });

      if (apiError) {
        throw new Error(apiError.message || 'Failed to fetch pull requests');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch pull requests');
      }

      setPRs(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pull requests';
      setError(errorMessage);
      toast({
        title: 'Error fetching pull requests',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getPR = useCallback(async (owner: string, repo: string, pullNumber: number): Promise<GitHubPR | null> => {
    try {
      const { data, error: apiError } = await supabase.functions.invoke('github-pr-operations/get-pr', {
        body: { owner, repo, pull_number: pullNumber }
      });

      if (apiError) {
        throw new Error(apiError.message || 'Failed to fetch pull request');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch pull request');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pull request';
      toast({
        title: 'Error fetching pull request',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const mergePR = useCallback(async (mergeRequest: MergeRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await supabase.functions.invoke('github-pr-operations/merge-pr', {
        body: mergeRequest
      });

      if (apiError) {
        throw new Error(apiError.message || 'Failed to merge pull request');
      }

      if (!data.success) {
        // Handle specific GitHub API errors
        let userFriendlyMessage = data.error || 'Failed to merge pull request';
        let toastTitle = 'Error merging pull request';
        
        if (data.error?.includes('merge conflicts')) {
          userFriendlyMessage = 'This pull request has merge conflicts that need to be resolved first.';
          toastTitle = 'Merge conflicts detected';
        } else if (data.error?.includes('not open')) {
          userFriendlyMessage = 'This pull request is no longer open.';
          toastTitle = 'Pull request closed';
        } else if (data.error?.includes('already merged')) {
          userFriendlyMessage = 'This pull request has already been merged.';
          toastTitle = 'Already merged';
        } else if (data.error?.includes('draft')) {
          userFriendlyMessage = 'Draft pull requests cannot be merged. Convert to ready for review first.';
          toastTitle = 'Draft pull request';
        } else if (data.error?.includes('not configured')) {
          userFriendlyMessage = 'GitHub integration is not properly configured. Please reconfigure your GitHub token.';
          toastTitle = 'Integration error';
        } else if (data.error?.includes('permission')) {
          userFriendlyMessage = 'You don\'t have permission to merge this pull request. Check your repository access.';
          toastTitle = 'Permission denied';
        }
        
        throw new Error(userFriendlyMessage);
      }

      toast({
        title: 'Success!',
        description: data.message || `Pull request #${mergeRequest.pull_number} merged successfully`,
      });

      // Refresh PRs list to update the UI
      await fetchPRs(mergeRequest.owner, mergeRequest.repo);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to merge pull request';
      setError(errorMessage);
      
      // Provide helpful suggestions based on error type
      let description = errorMessage;
      if (errorMessage.includes('merge conflicts')) {
        description += '\n\nTip: Resolve conflicts in your local branch and push the changes.';
      } else if (errorMessage.includes('permission')) {
        description += '\n\nTip: Make sure your GitHub token has the required permissions.';
      }
      
      toast({
        title: 'Merge failed',
        description,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchPRs]);

  const squashAndMerge = useCallback(async (
    owner: string, 
    repo: string, 
    pullNumber: number, 
    commitTitle?: string, 
    commitMessage?: string
  ): Promise<boolean> => {
    return mergePR({
      owner,
      repo,
      pull_number: pullNumber,
      merge_method: 'squash',
      commit_title: commitTitle,
      commit_message: commitMessage,
    });
  }, [mergePR]);

  const mergeWithMergeCommit = useCallback(async (
    owner: string, 
    repo: string, 
    pullNumber: number, 
    commitMessage?: string
  ): Promise<boolean> => {
    return mergePR({
      owner,
      repo,
      pull_number: pullNumber,
      merge_method: 'merge',
      commit_message: commitMessage,
    });
  }, [mergePR]);

  const rebaseAndMerge = useCallback(async (
    owner: string, 
    repo: string, 
    pullNumber: number
  ): Promise<boolean> => {
    return mergePR({
      owner,
      repo,
      pull_number: pullNumber,
      merge_method: 'rebase',
    });
  }, [mergePR]);

  return {
    prs,
    isLoading,
    error,
    fetchPRs,
    getPR,
    mergePR,
    squashAndMerge,
    mergeWithMergeCommit,
    rebaseAndMerge,
  };
}