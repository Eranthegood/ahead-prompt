import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendToCursorRequest {
  prompt: string;
  repository: string;
  ref?: string;
  branchName?: string;
  autoCreatePr?: boolean;
  webhookUrl?: string;
  model?: string;
}

interface CursorAgentResponse {
  id: string;
  name: string;
  status: string;
  source: {
    repository: string;
    ref: string;
  };
  target: {
    branchName: string;
    url: string;
    autoCreatePr: boolean;
  };
  createdAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send to Cursor request received');
    
    // Initialize Supabase client and get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          details: 'Please log in to use Cursor integration'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authentication',
          details: 'Please log in again'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user-specific Cursor API key from secrets table
    const userCursorTokenKey = `CURSOR_TOKEN_${user.id}`;
    const { data: secretRow, error: secretError } = await supabase
      .from('secrets')
      .select('secret_value')
      .eq('user_id', user.id)
      .eq('secret_name', userCursorTokenKey)
      .maybeSingle();

    if (secretError) {
      console.error('Error fetching stored Cursor token:', secretError);
    }

    const cursorApiKey = secretRow?.secret_value as string | undefined;
    if (!cursorApiKey) {
      console.error(`User-specific CURSOR_TOKEN not found: ${userCursorTokenKey}`);
      return new Response(
        JSON.stringify({ 
          error: 'Cursor not configured',
          details: 'Please configure your Cursor integration first'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      prompt,
      repository,
      ref = 'main',
      branchName,
      autoCreatePr = false,
      webhookUrl,
      model = 'claude-4-sonnet'
    }: SendToCursorRequest = await req.json();

    // Validate required fields
    if (!prompt || !repository) {
      console.error('Missing required fields:', { prompt: !!prompt, repository: !!repository });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'Both prompt and repository are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate GitHub repository URL
    const githubRepoRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubRepoRegex.test(repository)) {
      console.error('Invalid repository URL:', repository);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid repository URL',
          details: 'Repository must be a valid GitHub URL (https://github.com/user/repo)'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Creating Cursor agent:', {
      repository,
      ref,
      promptLength: prompt.length,
      model,
      webhookUrl: !!webhookUrl
    });

    // Prepare the request body for Cursor API
    const requestBody: any = {
      prompt: {
        text: prompt
      },
      source: {
        repository,
        ref
      },
      model,
      target: {
        autoCreatePr
      }
    };

    // Add optional fields
    if (branchName) {
      requestBody.target.branchName = branchName;
    }

    if (webhookUrl) {
      requestBody.webhook = {
        url: webhookUrl,
        secret: crypto.randomUUID() // Generate a random secret for webhook verification
      };
    }

    console.log('Sending request to Cursor API...');

    // Send request to Cursor Background Agents API
    const response = await fetch('https://api.cursor.com/v0/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cursorApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Cursor API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cursor API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      let errorMessage = 'Failed to create Cursor agent';
      let details = errorText;

      // Handle specific error cases
      switch (response.status) {
        case 401:
          errorMessage = 'Invalid Cursor API key';
          details = 'Please check your Cursor API key configuration';
          break;
        case 403:
          errorMessage = 'Access denied';
          details = 'Your Cursor account may not have access to this repository or the Background Agents API';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded';
          details = 'Too many requests to Cursor API. Please try again later';
          break;
        case 400:
          errorMessage = 'Invalid request';
          details = errorText || 'The request parameters are invalid';
          break;
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details,
          status: response.status
        }),
        {
          status: response.status >= 500 ? 500 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const agentData: CursorAgentResponse = await response.json();
    console.log('Cursor agent created successfully:', {
      id: agentData.id,
      status: agentData.status,
      url: agentData.target?.url
    });

    return new Response(
      JSON.stringify({
        success: true,
        agent: {
          id: agentData.id,
          name: agentData.name,
          status: agentData.status,
          repository: agentData.source.repository,
          branch: agentData.target?.branchName,
          url: agentData.target?.url,
          createdAt: agentData.createdAt
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in send-to-cursor function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});