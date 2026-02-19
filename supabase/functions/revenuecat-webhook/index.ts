import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product ID config from env
const MONTHLY_PRODUCT_IDS = (Deno.env.get("MONTHLY_PRODUCT_ID") || "").split(",").map(s => s.trim()).filter(Boolean);
const ANNUAL_PRODUCT_IDS = (Deno.env.get("ANNUAL_PRODUCT_ID") || "").split(",").map(s => s.trim()).filter(Boolean);

function detectPeriod(productId: string): "monthly" | "annual" | null {
  if (MONTHLY_PRODUCT_IDS.includes(productId)) return "monthly";
  if (ANNUAL_PRODUCT_IDS.includes(productId)) return "annual";
  // Fallback heuristic
  const lower = productId.toLowerCase();
  if (lower.includes("annual") || lower.includes("yearly")) return "annual";
  if (lower.includes("month")) return "monthly";
  return null;
}

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
    event_timestamp_ms?: number;
  };
  api_version: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const logContext = { timestamp: new Date().toISOString(), function: "revenuecat-webhook" };

  // Health check
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error({ ...logContext, error: "REVENUECAT_WEBHOOK_SECRET not configured" });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.error({ ...logContext, error: "Unauthorized", headerPresent: !!authHeader });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: RevenueCatEvent = await req.json();
    const event = payload.event;
    const environment = event.environment || "UNKNOWN";

    const appUserId = event.app_user_id || "";
    const originalAppUserId = event.original_app_user_id || "";
    const isAnonymousUser = appUserId.startsWith("$RCAnonymousID") || originalAppUserId.startsWith("$RCAnonymousID");
    const userId = event.type === "TRANSFER" ? appUserId : (originalAppUserId || appUserId);

    const maskedUserId = isAnonymousUser
      ? "anonymous-" + (originalAppUserId || appUserId).substring(0, 12)
      : userId.substring(0, 8) + "...";

    console.log({
      ...logContext, environment, eventType: event.type, eventId: event.id,
      periodType: event.period_type, store: event.store, productId: event.product_id,
      maskedUserId, isAnonymousUser,
    });

    if (isAnonymousUser) {
      console.warn({ ...logContext, warning: "ANONYMOUS_USER_DETECTED" });
    }

    // Init Supabase service client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Idempotency: skip if we've already processed a newer event ──
    const eventTimestamp = event.event_timestamp_ms
      ? new Date(event.event_timestamp_ms).toISOString()
      : new Date().toISOString();

    // ── Subscription table sync (existing behaviour) ──
    const SUBSCRIPTION_EVENTS = ["INITIAL_PURCHASE", "RENEWAL", "TRANSFER", "CANCELLATION", "EXPIRATION", "BILLING_ISSUE"];

    if (!isAnonymousUser && userId && SUBSCRIPTION_EVENTS.includes(event.type)) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user) {
        const subscriptionData = {
          user_id: userId,
          revenuecat_customer_id: userId,
          revenuecat_product_id: event.product_id,
          status: (event.type === "EXPIRATION" || event.type === "CANCELLATION") ? "inactive" : "active",
          current_period_start: event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null,
          current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
          plan_type: event.period_type === "TRIAL" ? "trial" : "premium",
          updated_at: new Date().toISOString(),
        };
        const { error: upsertError } = await supabase
          .from("subscriptions")
          .upsert(subscriptionData, { onConflict: "user_id" });
        if (upsertError) {
          console.error({ ...logContext, action: "subscription-upsert-failed", error: upsertError.message });
        } else {
          console.log({ ...logContext, action: "subscription-updated", userId: maskedUserId });
        }
      }
    }

    // ── Skip promotional/non-billing events from triggering referral payouts ──
    const isPromotional = event.product_id?.startsWith("rc_promo_") || event.period_type === "PROMOTIONAL";
    if (isPromotional) {
      console.log({ ...logContext, action: "promotional-event-skipped", eventType: event.type, maskedUserId });
    }

    // ── Referral / Commission Logic (skip promotional) ──
    if (!isAnonymousUser && userId && !isPromotional) {
      // Fetch the referral row for this user
      const { data: referral, error: refError } = await supabase
        .from("referrals")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (refError) {
        console.error({ ...logContext, action: "referral-fetch-failed", error: refError.message });
      }

      if (referral) {
        // Idempotency: skip if this event is older than the last processed one
        if (referral.latest_rc_event_at && new Date(eventTimestamp) <= new Date(referral.latest_rc_event_at)) {
          console.log({ ...logContext, action: "referral-event-skipped", reason: "older-event" });
        } else {
          // A) Trial started
          if (event.type === "INITIAL_PURCHASE" && event.period_type === "TRIAL") {
            if (referral.status === "claimed") {
              const { error } = await supabase
                .from("referrals")
                .update({ status: "trial_started", latest_rc_event_at: eventTimestamp })
                .eq("id", referral.id);
              if (error) console.error({ ...logContext, action: "referral-trial-update-failed", error: error.message });
              else console.log({ ...logContext, action: "referral-trial-started", userId: maskedUserId });
            }
          }

          // B) Trial converted to paid (first charge after trial)
          // RevenueCat sends RENEWAL with period_type=NORMAL for trial-to-paid conversion
          else if (
            event.type === "RENEWAL" && event.period_type === "NORMAL" &&
            ["claimed", "trial_started"].includes(referral.status)
          ) {
            const period = detectPeriod(event.product_id);

            // Fetch influencer commission rates
            const { data: influencer } = await supabase
              .from("influencers")
              .select("commission_monthly_cpa, commission_annual_cpa")
              .eq("id", referral.influencer_id)
              .single();

            let payableAmount = 0;
            if (influencer && period === "monthly") {
              payableAmount = influencer.commission_monthly_cpa;
            } else if (influencer && period === "annual") {
              payableAmount = influencer.commission_annual_cpa;
            }

            const { error } = await supabase
              .from("referrals")
              .update({
                status: "converted",
                converted_at: eventTimestamp,
                converted_product_id: event.product_id,
                converted_period: period,
                payable_amount: payableAmount,
                latest_rc_event_at: eventTimestamp,
              })
              .eq("id", referral.id);

            if (error) console.error({ ...logContext, action: "referral-conversion-failed", error: error.message });
            else console.log({ ...logContext, action: "referral-converted", period, payableAmount, userId: maskedUserId });
          }

          // Also handle INITIAL_PURCHASE with NORMAL period (direct purchase, no trial)
          else if (
            event.type === "INITIAL_PURCHASE" && event.period_type === "NORMAL" &&
            ["claimed", "trial_started"].includes(referral.status)
          ) {
            const period = detectPeriod(event.product_id);
            const { data: influencer } = await supabase
              .from("influencers")
              .select("commission_monthly_cpa, commission_annual_cpa")
              .eq("id", referral.influencer_id)
              .single();

            let payableAmount = 0;
            if (influencer && period === "monthly") payableAmount = influencer.commission_monthly_cpa;
            else if (influencer && period === "annual") payableAmount = influencer.commission_annual_cpa;

            const { error } = await supabase
              .from("referrals")
              .update({
                status: "converted",
                converted_at: eventTimestamp,
                converted_product_id: event.product_id,
                converted_period: period,
                payable_amount: payableAmount,
                latest_rc_event_at: eventTimestamp,
              })
              .eq("id", referral.id);

            if (error) console.error({ ...logContext, action: "referral-conversion-failed", error: error.message });
            else console.log({ ...logContext, action: "referral-converted-direct", period, payableAmount, userId: maskedUserId });
          }

          // C) Refund handling
          else if (event.type === "REFUND" && referral.status === "converted") {
            const { error } = await supabase
              .from("referrals")
              .update({
                status: "refunded",
                payable_amount: 0,
                latest_rc_event_at: eventTimestamp,
              })
              .eq("id", referral.id);

            if (error) console.error({ ...logContext, action: "referral-refund-failed", error: error.message });
            else console.log({ ...logContext, action: "referral-refunded", userId: maskedUserId });
          }

          // Default: update latest_rc_event_at for tracking
          else {
            await supabase
              .from("referrals")
              .update({ latest_rc_event_at: eventTimestamp })
              .eq("id", referral.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Event processed" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error({ ...logContext, error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: "An error occurred. Please try again later." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
