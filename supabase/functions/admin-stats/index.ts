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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side admin role check
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch influencer stats using service role (bypasses RLS)
    const { data: stats, error: statsError } = await supabaseAdmin
      .from("influencer_referral_stats")
      .select("*");

    if (statsError) {
      console.error("Error fetching stats:", statsError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch stats" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch pending payouts
    const { data: payouts, error: payoutError } = await supabaseAdmin
      .from("referrals")
      .select("id, code, converted_period, payable_amount, converted_at, influencer_id")
      .eq("status", "converted")
      .gt("payable_amount", 0)
      .order("converted_at", { ascending: false });

    let pendingPayouts: any[] = [];
    if (!payoutError && payouts && payouts.length > 0) {
      const influencerIds = [...new Set(payouts.map((p: any) => p.influencer_id))];
      const { data: influencers } = await supabaseAdmin
        .from("influencers")
        .select("id, handle")
        .in("id", influencerIds);

      const handleMap = new Map((influencers || []).map((i: any) => [i.id, i.handle]));
      pendingPayouts = payouts.map((p: any) => ({
        id: p.id,
        handle: handleMap.get(p.influencer_id) || "Unknown",
        code: p.code,
        converted_period: p.converted_period || "unknown",
        payable_amount: p.payable_amount || 0,
        converted_at: p.converted_at || "",
      }));
    }

    return new Response(
      JSON.stringify({ stats: stats || [], pendingPayouts }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in admin-stats:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
