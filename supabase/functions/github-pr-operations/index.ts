import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubPR {
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

interface MergeRequest {
  owner: string;
  repo: string;
  pull_number: number;
  commit_title?: string;
  commit_message?: string;
  merge_method: 'merge' | 'squash' | 'rebase';
}

async function getGitHubToken(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_secrets')
      .select('encrypted_value')
      .eq('user_id', userId)
      .eq('key', 'github_token')
      .single();

    if (error || !data) {
      console.error('No GitHub token found for user:', userId);
      return null;
    }

    // In production, you would decrypt this value
    // For now, assuming it's stored as plaintext (not recommended)
    return data.encrypted_value;
  } catch (error) {
    console.error('Error fetching GitHub token:', error);
    return null;
  }
}

async function fetchPullRequests(token: string, owner: string, repo: string): Promise<GitHubPR[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=50`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function mergePullRequest(token: string, request: MergeRequest): Promise<any> {
  const { owner, repo, pull_number, commit_title, commit_message, merge_method } = request;
  
  const body: any = {
    merge_method,
  };

  if (commit_title) {
    body.commit_title = commit_title;
  }

  if (commit_message) {
    body.commit_message = commit_message;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/merge`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
  }

  return await response.json();
}

async function getPullRequest(token: string, owner: string, repo: string, pull_number: number): Promise<GitHubPR> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get GitHub token for user
    const githubToken = await getGitHubToken(supabase, user.id);
    if (!githubToken) {
      throw new Error('GitHub integration not configured. Please configure GitHub integration first.');
    }

    switch (action) {
      case 'list-prs': {
        const { owner, repo } = await req.json();
        if (!owner || !repo) {
          throw new Error('Owner and repo parameters are required');
        }

        const prs = await fetchPullRequests(githubToken, owner, repo);
        
        return new Response(JSON.stringify({
          success: true,
          data: prs,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-pr': {
        const { owner, repo, pull_number } = await req.json();
        if (!owner || !repo || !pull_number) {
          throw new Error('Owner, repo, and pull_number parameters are required');
        }

        const pr = await getPullRequest(githubToken, owner, repo, pull_number);
        
        return new Response(JSON.stringify({
          success: true,
          data: pr,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'merge-pr': {
        const mergeRequest: MergeRequest = await req.json();
        
        if (!mergeRequest.owner || !mergeRequest.repo || !mergeRequest.pull_number) {
          throw new Error('Owner, repo, and pull_number are required');
        }

        if (!['merge', 'squash', 'rebase'].includes(mergeRequest.merge_method)) {
          throw new Error('merge_method must be one of: merge, squash, rebase');
        }

        // First check if PR is mergeable
        const pr = await getPullRequest(githubToken, mergeRequest.owner, mergeRequest.repo, mergeRequest.pull_number);
        
        if (pr.state !== 'open') {
          throw new Error('Pull request is not open');
        }

        if (pr.merged) {
          throw new Error('Pull request is already merged');
        }

        if (pr.mergeable === false) {
          throw new Error('Pull request has merge conflicts and cannot be merged');
        }

        if (pr.draft) {
          throw new Error('Cannot merge draft pull request');
        }

        // Perform the merge
        const result = await mergePullRequest(githubToken, mergeRequest);
        
        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: `Pull request #${mergeRequest.pull_number} successfully ${mergeRequest.merge_method}d`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('GitHub PR operations error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});