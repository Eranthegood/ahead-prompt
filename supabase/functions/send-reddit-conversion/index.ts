import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionEvent {
  eventType: 'Purchase' | 'SignUp' | 'ViewContent' | 'Custom';
  customEventName?: string;
  conversionId: string;
  userId?: string;
  userEmail?: string;
  value?: number;
  currency?: string;
  contentType?: string;
  contentId?: string;
  promptId?: string;
  testMode?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const redditApiToken = Deno.env.get('REDDIT_API_TOKEN');
    if (!redditApiToken) {
      throw new Error('Reddit API token not configured');
    }

    const { event }: { event: ConversionEvent } = await req.json();
    
    console.log('[Reddit Conversions API] Processing event:', {
      eventType: event.eventType,
      conversionId: event.conversionId,
      userId: event.userId,
      testMode: event.testMode || false
    });

    // Reddit account ID from the curl example
    const redditAccountId = 'a2_hm56jybr1umg';
    const redditApiUrl = `https://ads-api.reddit.com/api/v2.0/conversions/events/${redditAccountId}`;

    // Prepare event data for Reddit API
    const eventData = {
      test_mode: event.testMode || false,
      events: [
        {
          event_at: new Date().toISOString(),
          event_type: event.eventType === 'Custom' 
            ? {
                tracking_type: 'Custom',
                custom_event_name: event.customEventName
              }
            : {
                tracking_type: event.eventType
              },
          // Include additional conversion data
          conversion_id: event.conversionId,
          ...(event.userId && { user_id: event.userId }),
          ...(event.userEmail && { email: event.userEmail }),
          ...(event.value && { value: event.value }),
          ...(event.currency && { currency: event.currency }),
          ...(event.contentType && { content_type: event.contentType }),
          ...(event.contentId && { content_id: event.contentId }),
          ...(event.promptId && { prompt_id: event.promptId })
        }
      ]
    };

    console.log('[Reddit Conversions API] Sending event data:', JSON.stringify(eventData, null, 2));

    // Send conversion event to Reddit API
    const response = await fetch(redditApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redditApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[Reddit Conversions API] API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`Reddit API error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    console.log('[Reddit Conversions API] Success:', {
      status: response.status,
      conversionId: event.conversionId,
      response: responseText
    });

    return new Response(JSON.stringify({ 
      success: true, 
      conversionId: event.conversionId,
      redditResponse: responseText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Reddit Conversions API] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});