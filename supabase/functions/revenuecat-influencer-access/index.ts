import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate env vars
    const rcSecretKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");
    const rcEntitlementId = Deno.env.get("REVENUECAT_ENTITLEMENT_ID") || "Premium";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!rcSecretKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing env var REVENUECAT_SECRET_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized – missing Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ ok: false, error: "Forbidden – admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Validate request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { action, user_id, duration_days } = body as {
      action?: string;
      user_id?: string;
      duration_days?: number;
    };

    if (!action || !["grant", "revoke", "status"].includes(action)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid action. Must be 'grant', 'revoke', or 'status'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (typeof user_id !== "string" || !UUID_RE.test(user_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid user_id. Must be a valid UUID string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const days = duration_days ?? 90;
    if (action === "grant" && (typeof days !== "number" || days <= 0)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid duration_days. Must be a positive number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const maskedUid = user_id.substring(0, 8) + "...";
    console.log(`[influencer-access] action=${action} user=${maskedUid} duration=${days}`);

    const rcHeaders = {
      "Authorization": `Bearer ${rcSecretKey}`,
      "Content-Type": "application/json",
    };

    // 4. Execute action
    if (action === "grant") {
      const startTimeMs = Date.now();
      const endTimeMs = startTimeMs + days * 24 * 60 * 60 * 1000;

      const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user_id)}/entitlements/${encodeURIComponent(rcEntitlementId)}/promotional`;
      const res = await fetch(rcUrl, {
        method: "POST",
        headers: rcHeaders,
        body: JSON.stringify({
          end_time_ms: endTimeMs,
        }),
      });

      const resText = await res.text();
      console.log(`[influencer-access] grant response status=${res.status} user=${maskedUid}`);

      if (!res.ok) {
        console.error(`[influencer-access] grant FAILED status=${res.status} body=${resText}`);
        return new Response(
          JSON.stringify({ ok: false, error: "RevenueCat error", status: res.status, body: resText }),
          { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const expiresAt = new Date(endTimeMs).toISOString();
      return new Response(
        JSON.stringify({ ok: true, action: "granted", expires_at: expiresAt, duration_days: days }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "revoke") {
      const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user_id)}/entitlements/${encodeURIComponent(rcEntitlementId)}/revoke_promotionals`;
      const res = await fetch(rcUrl, {
        method: "POST",
        headers: rcHeaders,
      });

      const resText = await res.text();
      console.log(`[influencer-access] revoke response status=${res.status} user=${maskedUid}`);

      if (!res.ok) {
        console.error(`[influencer-access] revoke FAILED status=${res.status} body=${resText}`);
        return new Response(
          JSON.stringify({ ok: false, error: "RevenueCat error", status: res.status, body: resText }),
          { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ ok: true, action: "revoked" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // action === "status"
    const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user_id)}`;
    const res = await fetch(rcUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${rcSecretKey}` },
    });

    const resText = await res.text();
    if (!res.ok) {
      console.error(`[influencer-access] status FAILED status=${res.status} body=${resText}`);
      return new Response(
        JSON.stringify({ ok: false, error: "RevenueCat error", status: res.status, body: resText }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rcData = JSON.parse(resText);
    const entitlements = rcData?.subscriber?.entitlements || {};
    const premiumEnt = entitlements[rcEntitlementId];

    return new Response(
      JSON.stringify({
        ok: true,
        action: "status",
        has_premium: !!premiumEnt,
        expires_date: premiumEnt?.expires_date || null,
        product_identifier: premiumEnt?.product_identifier || null,
        is_sandbox: premiumEnt?.is_sandbox || false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`[influencer-access] Unhandled error: ${msg}`, stack);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error", message: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
