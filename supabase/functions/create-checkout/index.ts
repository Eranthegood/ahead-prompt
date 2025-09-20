import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { priceId, couponId } = await req.json();
    if (!priceId) {
      throw new Error("priceId is required");
    }
    logStep("Price ID received", { priceId, couponId });

  // Create a Supabase client using the anon key
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Get the authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No authorization header provided");
  logStep("Authorization header found");

  const token = authHeader.replace("Bearer ", "");
  logStep("Attempting to authenticate user with token");
  
  const { data, error: authError } = await supabaseClient.auth.getUser(token);
  if (authError) {
    logStep("Authentication error", { error: authError.message });
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  
  const user = data.user;
  if (!user?.email) {
    logStep("User data incomplete", { user: user });
    throw new Error("User not authenticated or email not available");
  }
  logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Validate coupon if provided
    let validatedCoupon = null;
    if (couponId) {
      try {
        validatedCoupon = await stripe.coupons.retrieve(couponId);
        logStep("Coupon validated", { couponId, valid: validatedCoupon.valid });
        
        if (!validatedCoupon.valid) {
          logStep("Coupon not valid; proceeding without discount", { couponId });
          validatedCoupon = null;
        }
      } catch (couponError) {
        logStep("Coupon validation failed", { couponId, error: (couponError as any).message });
        // Proceed without coupon if invalid/non-existent
        validatedCoupon = null;
      }
    }

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Create checkout session
    const couponApplied = !!validatedCoupon;
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/settings?tab=subscription&success=true`,
      cancel_url: `${req.headers.get("origin")}/settings?tab=subscription&canceled=true`,
      allow_promotion_codes: true,
    };

    // Add discount if coupon is validated
    if (validatedCoupon) {
      sessionConfig.discounts = [{ coupon: couponId }];
      logStep("Discount applied to session", { couponId });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, coupon_applied: couponApplied }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});