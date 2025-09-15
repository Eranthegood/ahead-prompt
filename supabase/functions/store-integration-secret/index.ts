import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StoreSecretRequest {
  integrationType: 'github' | 'cursor' | 'claude';
  token: string;
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
    const { integrationType, token } = await req.json() as StoreSecretRequest
    
    if (!integrationType || !token) {
      return Response.json(
        { success: false, error: 'Integration type and token are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from request
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return Response.json(
        { success: false, error: 'Authorization header required' },
        { status: 401, headers: corsHeaders }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return Response.json(
        { success: false, error: 'Invalid user token' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Store token in Supabase Secrets
    const secretKey = `${integrationType.toUpperCase()}_TOKEN_${user.id}`
    
    try {
      const secretsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/secrets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        },
        body: JSON.stringify({
          name: secretKey,
          value: token
        })
      })

      if (!secretsResponse.ok) {
        const errorText = await secretsResponse.text()
        console.error('Failed to store secret:', errorText)
        throw new Error('Failed to store token securely')
      }
      
      console.log(`${integrationType} token stored securely for user: ${user.id}`)
      
      return Response.json({
        success: true,
        message: `${integrationType} token stored successfully`
      }, {
        headers: corsHeaders
      })
      
    } catch (e) {
      console.error(`Error storing ${integrationType} token:`, e)
      return Response.json(
        { success: false, error: 'Failed to store token securely' },
        { status: 500, headers: corsHeaders }
      )
    }

  } catch (error) {
    console.error('Error in store-integration-secret function:', error)
    
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
})