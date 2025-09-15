import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ValidateCursorRequest {
  token: string;
}

interface CursorValidationResponse {
  isValid: boolean;
  user?: {
    username?: string;
    email?: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    const { token, test } = await req.json() as ValidateCursorRequest & { test?: boolean }
    
    let testToken = token;
    
    // Always get user authentication for security
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return Response.json(
        { isValid: false, error: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return Response.json(
        { isValid: false, error: 'Invalid authentication' },
        { status: 401, headers: corsHeaders }
      )
    }

    // If this is a test call, try to get stored token
    if (test && !token) {
      const secretKey = `CURSOR_TOKEN_${user.id}`
      testToken = Deno.env.get(secretKey)
      
      if (!testToken) {
        return Response.json(
          { isValid: false, error: 'No Cursor token configured for this user' },
          { headers: corsHeaders }
        )
      }
    }
    
    if (!testToken) {
      return Response.json(
        { isValid: false, error: 'Token is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Test the Cursor API token by making a simple API call
    const testResponse = await fetch('https://api.cursor.com/v0/agents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (testResponse.ok) {
      // Token is valid - try to get user info if available
      const response: CursorValidationResponse = {
        isValid: true,
        user: {
          username: 'Cursor User',
          email: undefined
        }
      }

      return Response.json(response, {
        headers: corsHeaders
      })
    } else if (testResponse.status === 401) {
      return Response.json(
        { isValid: false, error: 'Invalid or expired token' },
        { headers: corsHeaders }
      )
    } else {
      const errorText = await testResponse.text()
      console.error('Cursor API error:', testResponse.status, errorText)
      
      return Response.json(
        { isValid: false, error: 'Unable to validate token' },
        { status: testResponse.status, headers: corsHeaders }
      )
    }
  } catch (error) {
    console.error('Error validating Cursor token:', error)
    
    return Response.json(
      { isValid: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
})