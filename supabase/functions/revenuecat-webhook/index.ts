import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RevenueCat webhook event types we log
const SUBSCRIPTION_EVENTS = [
  "INITIAL_PURCHASE",
  "RENEWAL",
  "TRANSFER",
  "CANCELLATION",
  "EXPIRATION",
  "BILLING_ISSUE",
];

interface RevenueCatEvent {
  event: {
    id: string;
    type: string;
    app_user_id: string;
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number;
    store: string;
    environment: string;
    is_trial_conversion?: boolean;
    transaction_id?: string;
  };
  api_version: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const logContext = {
    timestamp: new Date().toISOString(),
    function: "revenuecat-webhook",
  };

  // ============================================
  // HEALTH CHECK: GET /revenuecat-webhook/health
  // ============================================
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    console.log({ ...logContext, action: "health-check", status: "ok" });
    return new Response(JSON.stringify({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "RevenueCat webhook is reachable"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ============================================
    // 1) SECURITY: Validate Authorization header
    // ============================================
    const authHeader = req.headers.get("Authorization");
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      console.error({ ...logContext, error: "REVENUECAT_WEBHOOK_SECRET not configured" });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expectedAuth = `Bearer ${webhookSecret}`;
    const authorized = authHeader === expectedAuth;
    
    if (!authorized) {
      console.error({ 
        ...logContext, 
        authorized: false,
        error: "Invalid or missing authorization header",
        headerPresent: !!authHeader,
      });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // 2) Parse payload and log safely (no PII)
    // ============================================
    const payload: RevenueCatEvent = await req.json();
    const event = payload.event;
    const environment = event.environment || "UNKNOWN";
    
    // Detect anonymous vs identified users
    const appUserId = event.app_user_id || "";
    const originalAppUserId = event.original_app_user_id || "";
    const isAnonymousUser = appUserId.startsWith("$RCAnonymousID") || originalAppUserId.startsWith("$RCAnonymousID");
    
    // Safe masked user ID for logging
    const maskedUserId = isAnonymousUser 
      ? "anonymous-" + (originalAppUserId || appUserId).substring(0, 12)
      : (originalAppUserId || appUserId).substring(0, 8) + "...";
    
    // Log event details without PII
    console.log({
      ...logContext,
      authorized: true,
      environment,
      eventType: event.type,
      eventId: event.id,
      transactionId: event.transaction_id || null,
      periodType: event.period_type,
      store: event.store,
      productId: event.product_id,
      maskedUserId,
      isAnonymousUser,
    });
    
    // Warn about anonymous users
    if (isAnonymousUser) {
      console.warn({
        ...logContext,
        warning: "ANONYMOUS_USER_DETECTED",
        message: "Purchase made with anonymous user ID",
        recommendation: "Ensure Purchases.logIn(supabaseUserId) is called before purchase",
      });
    }

    // ============================================
    // 3) Log subscription events for monitoring
    // ============================================
    if (SUBSCRIPTION_EVENTS.includes(event.type)) {
      console.log({ 
        ...logContext, 
        action: "subscription-event-logged",
        eventType: event.type,
        periodType: event.period_type,
        expirationAt: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      });
    }

    // ============================================
    // 4) Update subscription record if user exists
    // ============================================
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine user ID (for TRANSFER events, use app_user_id as the new owner)
    const isTransferEvent = event.type === "TRANSFER";
    const userId = isTransferEvent 
      ? event.app_user_id
      : (event.original_app_user_id || event.app_user_id);

    // Skip if anonymous user
    if (!isAnonymousUser && userId) {
      // Check if user exists
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      
      if (userData?.user) {
        // Upsert subscription record
        const subscriptionData = {
          user_id: userId,
          revenuecat_customer_id: userId,
          revenuecat_product_id: event.product_id,
          status: event.type === "EXPIRATION" || event.type === "CANCELLATION" ? "inactive" : "active",
          current_period_start: event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null,
          current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
          plan_type: event.period_type === "TRIAL" ? "trial" : "premium",
          updated_at: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from("subscriptions")
          .upsert(subscriptionData, {
            onConflict: "user_id",
          });

        if (upsertError) {
          console.error({ ...logContext, action: "subscription-upsert-failed", error: upsertError.message });
        } else {
          console.log({ ...logContext, action: "subscription-updated", userId: maskedUserId });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Event processed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error({ ...logContext, error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: "An error occurred. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
