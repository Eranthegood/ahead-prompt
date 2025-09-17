import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  updated_at?: string;
  created_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, test } = await req.json() as { token?: string; test?: boolean };

    // Initialize Supabase client early to authenticate and optionally fetch stored token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from request for security and per-user secret lookup
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Determine which token to use: prefer provided token, otherwise load from secrets table
    let effectiveToken = token;
    if (!effectiveToken || test) {
      const secretKey = `GITHUB_TOKEN_${user.id}`;
      const { data: secretRow, error: secretError } = await supabase
        .from('secrets')
        .select('secret_value')
        .eq('user_id', user.id)
        .eq('secret_name', secretKey)
        .maybeSingle();

      if (secretError) {
        console.error('Error fetching stored GitHub token:', secretError);
      }

      if (!effectiveToken && secretRow?.secret_value) {
        effectiveToken = secretRow.secret_value as string;
      }
    }

    if (!effectiveToken) {
      throw new Error('GitHub token is required or not configured for this user');
    }

    console.log('Validating GitHub token...');

    // Validate token with GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${effectiveToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Invalid GitHub token');
    }

    const userData: GitHubUser = await userResponse.json();
    console.log('GitHub user validated:', userData.login);

    // Get user repositories with comprehensive fetching
    const allRepos: GitHubRepo[] = [];
    
    // Fetch repositories with different sorting to get a comprehensive list
    const sortOptions = ['updated', 'created', 'pushed', 'full_name'];
    
    for (const sort of sortOptions) {
      const reposResponse = await fetch(`https://api.github.com/user/repos?sort=${sort}&per_page=100&type=all&visibility=all`, {
        headers: {
          'Authorization': `token ${effectiveToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (reposResponse.ok) {
        const reposData: GitHubRepo[] = await reposResponse.json();
        
        // Add repos that aren't already in our list (deduplicate by full_name)
        for (const repo of reposData) {
          if (!allRepos.some(existing => existing.full_name === repo.full_name)) {
            allRepos.push(repo);
          }
        }
      }
    }
    
    // Sort final list by updated date (most recent first)
    allRepos.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    console.log(`Fetched ${allRepos.length} repositories for user ${userData.login}`);

    console.log('Updating integration for user:', user.id);

    // Store/update integration in database
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        integration_type: 'github',
        is_configured: true,
        is_enabled: true,
        last_test_result: 'success',
        last_test_time: new Date().toISOString(),
        metadata: {
          username: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          public_repos: userData.public_repos,
          repositories: allRepos.map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            html_url: repo.html_url,
            updated_at: repo.updated_at,
            created_at: repo.created_at
          }))
        }
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save integration');
    }

    console.log('GitHub token validated and integration stored successfully');
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        public_repos: userData.public_repos
      },
      repositories: allRepos.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        updated_at: repo.updated_at,
        created_at: repo.created_at
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-github-token function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});