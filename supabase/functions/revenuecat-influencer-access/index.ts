import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logContext = { timestamp: new Date().toISOString(), function: "revenuecat-influencer-access" };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const rcSecretKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");
    const rcEntitlementId = Deno.env.get("REVENUECAT_ENTITLEMENT_ID") || "Premium";

    if (!rcSecretKey) {
      console.error({ ...logContext, error: "REVENUECAT_SECRET_API_KEY not configured" });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, user_id, duration_days = 90 } = body;

    if (!action || !user_id) {
      return new Response(JSON.stringify({ error: "Missing action or user_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maskedUid = user_id.substring(0, 8) + "...";
    console.log({ ...logContext, action, maskedUserId: maskedUid, duration_days });

    const rcHeaders = {
      "Authorization": `Bearer ${rcSecretKey}`,
      "Content-Type": "application/json",
    };

    if (action === "grant") {
      // Grant promotional entitlement via RC V1 API
      const startTimeMs = Date.now();
      const endTimeMs = startTimeMs + (duration_days * 24 * 60 * 60 * 1000);

      const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user_id)}/entitlements/${encodeURIComponent(rcEntitlementId)}/promotional`;
      const rcResponse = await fetch(rcUrl, {
        method: "POST",
        headers: rcHeaders,
        body: JSON.stringify({
          duration: "custom",
          start_time_ms: startTimeMs,
          end_time_ms: endTimeMs,
        }),
      });

      const rcData = await rcResponse.text();
      console.log({ ...logContext, action: "grant-response", status: rcResponse.status, maskedUserId: maskedUid });

      if (!rcResponse.ok) {
        console.error({ ...logContext, action: "grant-failed", status: rcResponse.status, body: rcData });
        return new Response(JSON.stringify({ 
          error: "Failed to grant entitlement", 
          rc_status: rcResponse.status,
          details: rcData,
        }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const expiresAt = new Date(endTimeMs).toISOString();
      return new Response(JSON.stringify({ 
        success: true, 
        action: "granted",
        expires_at: expiresAt,
        duration_days,
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "revoke") {
      // Revoke promotional entitlement
      const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user_id)}/entitlements/${encodeURIComponent(rcEntitlementId)}/revoke_promotionals`;
      const rcResponse = await fetch(rcUrl, {
        method: "POST",
        headers: rcHeaders,
      });

      const rcData = await rcResponse.text();
      console.log({ ...logContext, action: "revoke-response", status: rcResponse.status, maskedUserId: maskedUid });

      if (!rcResponse.ok) {
        console.error({ ...logContext, action: "revoke-failed", status: rcResponse.status, body: rcData });
        return new Response(JSON.stringify({ 
          error: "Failed to revoke entitlement",
          rc_status: rcResponse.status,
          details: rcData,
        }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        action: "revoked",
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "status") {
      // Check current entitlement status from RC
      const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user_id)}`;
      const rcResponse = await fetch(rcUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${rcSecretKey}` },
      });

      if (!rcResponse.ok) {
        const rcData = await rcResponse.text();
        console.error({ ...logContext, action: "status-failed", status: rcResponse.status });
        return new Response(JSON.stringify({ 
          error: "Failed to fetch status",
          rc_status: rcResponse.status,
        }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rcData = await rcResponse.json();
      const entitlements = rcData?.subscriber?.entitlements || {};
      const premiumEnt = entitlements[rcEntitlementId];

      return new Response(JSON.stringify({
        success: true,
        action: "status",
        has_premium: !!premiumEnt,
        expires_date: premiumEnt?.expires_date || null,
        product_identifier: premiumEnt?.product_identifier || null,
        is_sandbox: premiumEnt?.is_sandbox || false,
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use grant, revoke, or status." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error({ ...logContext, error: errMsg });
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
