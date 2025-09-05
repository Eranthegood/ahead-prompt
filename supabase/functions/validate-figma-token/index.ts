import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

interface FigmaTeam {
  id: string;
  name: string;
}

interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request
    const { token } = await req.json();
    
    if (!token) {
      console.error('No token provided');
      return new Response(
        JSON.stringify({ isValid: false, error: 'Personal Access Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Validating Figma token...');
    
    // Validate token by fetching user info
    const userResponse = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!userResponse.ok) {
      console.error('Invalid Figma token:', userResponse.status, userResponse.statusText);
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: 'Invalid Figma Personal Access Token' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userData: FigmaUser = await userResponse.json();
    console.log('Figma user validated:', userData.handle);

    // Get teams
    const teamsResponse = await fetch('https://api.figma.com/v1/teams', {
      headers: {
        'X-Figma-Token': token,
      },
    });

    let teams: FigmaTeam[] = [];
    if (teamsResponse.ok) {
      const teamsData = await teamsResponse.json();
      teams = teamsData.teams || [];
    }

    // Get recent files from teams
    const recentFiles: FigmaFile[] = [];
    for (const team of teams.slice(0, 3)) { // Limit to first 3 teams
      try {
        const filesResponse = await fetch(`https://api.figma.com/v1/teams/${team.id}/projects`, {
          headers: {
            'X-Figma-Token': token,
          },
        });
        
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          const projects = filesData.projects || [];
          
          for (const project of projects.slice(0, 2)) { // Limit projects per team
            const projectFilesResponse = await fetch(`https://api.figma.com/v1/projects/${project.id}/files`, {
              headers: {
                'X-Figma-Token': token,
              },
            });
            
            if (projectFilesResponse.ok) {
              const projectFilesData = await projectFilesResponse.json();
              const files = (projectFilesData.files || []).slice(0, 5); // Limit files per project
              recentFiles.push(...files);
            }
          }
        }
      } catch (error) {
        console.warn('Error fetching files for team:', team.id, error);
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Store or update integration in database
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        integration_type: 'figma',
        is_configured: true,
        is_enabled: true,
        metadata: {
          user: userData,
          teams: teams,
          recentFiles: recentFiles.slice(0, 10) // Keep only 10 most recent
        },
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('Error storing Figma integration:', upsertError);
    }

    return new Response(
      JSON.stringify({
        isValid: true,
        user: userData,
        teams: teams,
        recentFiles: recentFiles.slice(0, 10)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in validate-figma-token:', error);
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});