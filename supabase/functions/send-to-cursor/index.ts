import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    const cursorApiKey = Deno.env.get('CURSOR_API_KEY');
    if (!cursorApiKey) {
      console.error('CURSOR_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Cursor API key not configured',
          details: 'Please add your Cursor API key in the dashboard'
        }),
        {
          status: 500,
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