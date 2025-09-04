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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error('GitHub token is required');
    }

    console.log('Validating GitHub token...');

    // Validate token with GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Invalid GitHub token');
    }

    const userData: GitHubUser = await userResponse.json();
    console.log('GitHub user validated:', userData.login);

    // Get user repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const reposData: GitHubRepo[] = await reposResponse.json();

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
          repositories: reposData.map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            html_url: repo.html_url
          }))
        }
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save integration');
    }

    // Store token in secrets (this would be handled differently in production)
    // For now, we'll return success with user info
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        public_repos: userData.public_repos
      },
      repositories: reposData.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url
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