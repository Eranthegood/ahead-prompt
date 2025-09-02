import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoopsContact {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  subscribed?: boolean;
  userGroup?: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const loopsApiKey = Deno.env.get('LOOPS_API_KEY');
    if (!loopsApiKey) {
      console.error('LOOPS_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Loops API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user, profile } = await req.json();
    console.log('Syncing user to Loops:', { userId: user.id, email: user.email });

    // Prepare contact data for Loops
    const contactData: LoopsContact = {
      email: user.email,
      firstName: profile?.full_name?.split(' ')[0] || user.raw_user_meta_data?.name?.split(' ')[0] || '',
      lastName: profile?.full_name?.split(' ').slice(1).join(' ') || user.raw_user_meta_data?.name?.split(' ').slice(1).join(' ') || '',
      source: 'supabase-signup',
      subscribed: true,
      userGroup: 'ahead-users',
      userId: user.id,
    };

    // Add provider-specific tags
    const provider = user.app_metadata?.provider || 'email';
    if (provider === 'google') {
      contactData.userGroup = 'ahead-users-google';
    }

    console.log('Sending contact data to Loops:', contactData);

    // Send to Loops API
    const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loopsApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    let loopsResult;
    try {
      loopsResult = await loopsResponse.json();
    } catch (parseError) {
      // If we can't parse JSON, log the raw response text
      const responseText = await loopsResponse.text();
      console.error('Failed to parse Loops API response as JSON. Status:', loopsResponse.status);
      console.error('Raw response:', responseText);
      throw new Error(`Loops API returned non-JSON response (${loopsResponse.status}): ${responseText.substring(0, 200)}`);
    }
    
    if (!loopsResponse.ok) {
      console.error('Loops API error:', loopsResult);
      
      // Don't throw error for duplicates - Loops returns 409 for existing contacts
      if (loopsResponse.status === 409) {
        console.log('Contact already exists in Loops, skipping');
        return new Response(
          JSON.stringify({ success: true, message: 'Contact already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Loops API error: ${loopsResult.message || 'Unknown error'}`);
    }

    console.log('Successfully synced to Loops:', loopsResult);

    return new Response(
      JSON.stringify({ success: true, loopsResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-to-loops function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});