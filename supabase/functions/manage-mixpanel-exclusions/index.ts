import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, user_id, admin_user_id } = await req.json()
    console.log(`Processing ${action} for user ${user_id} by admin ${admin_user_id}`)

    if (!user_id || !admin_user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mixpanelSecret = Deno.env.get('MIXPANEL_PROJECT_SECRET')
    if (!mixpanelSecret) {
      console.error('MIXPANEL_PROJECT_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Mixpanel configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exclude') {
      // Add user to exclusion list in database
      const { data: exclusionData, error: exclusionError } = await supabaseClient
        .from('mixpanel_excluded_users')
        .insert({
          user_id: user_id,
          excluded_by: admin_user_id,
          reason: 'Admin exclusion'
        })
        .select()

      if (exclusionError) {
        console.error('Database error:', exclusionError)
        return new Response(
          JSON.stringify({ error: 'Failed to add exclusion to database' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update Mixpanel user profile
      const mixpanelUrl = `https://api.mixpanel.com/engage`
      const mixpanelData = {
        $token: mixpanelSecret,
        $distinct_id: user_id,
        $set: {
          exclude_from_analysis: true,
          excluded_at: new Date().toISOString(),
          excluded_by: admin_user_id
        }
      }

      const mixpanelResponse = await fetch(mixpanelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(JSON.stringify(mixpanelData))}`
      })

      const mixpanelResult = await mixpanelResponse.text()
      console.log('Mixpanel API response:', mixpanelResult)

      // Log the action
      await supabaseClient
        .from('mixpanel_exclusion_audit_log')
        .insert({
          user_id: user_id,
          action: 'exclude',
          performed_by: admin_user_id,
          mixpanel_response: mixpanelResult,
          success: mixpanelResult === '1'
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          mixpanel_success: mixpanelResult === '1',
          exclusion_id: exclusionData[0]?.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'include') {
      // Remove user from exclusion list
      const { error: deleteError } = await supabaseClient
        .from('mixpanel_excluded_users')
        .delete()
        .eq('user_id', user_id)

      if (deleteError) {
        console.error('Database error:', deleteError)
        return new Response(
          JSON.stringify({ error: 'Failed to remove exclusion from database' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update Mixpanel user profile
      const mixpanelUrl = `https://api.mixpanel.com/engage`
      const mixpanelData = {
        $token: mixpanelSecret,
        $distinct_id: user_id,
        $unset: ['exclude_from_analysis', 'excluded_at', 'excluded_by']
      }

      const mixpanelResponse = await fetch(mixpanelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(JSON.stringify(mixpanelData))}`
      })

      const mixpanelResult = await mixpanelResponse.text()
      console.log('Mixpanel API response:', mixpanelResult)

      // Log the action
      await supabaseClient
        .from('mixpanel_exclusion_audit_log')
        .insert({
          user_id: user_id,
          action: 'include',
          performed_by: admin_user_id,
          mixpanel_response: mixpanelResult,
          success: mixpanelResult === '1'
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          mixpanel_success: mixpanelResult === '1'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "exclude" or "include"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})