import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PreferenceRequest {
  enabled: boolean;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendAudienceId = Deno.env.get("RESEND_AUDIENCE_ID");

    // Validate authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create client with user's token to get their identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);

    if (claimsError || !claims?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claims.claims.sub;
    const userEmail = claims.claims.email as string;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    
    // Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle GET request - fetch current preference
    if (req.method === "GET") {
      const { data: subscription, error: selectError } = await supabaseAdmin
        .from("marketing_subscribers")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (selectError) {
        console.error("Error fetching subscription:", selectError);
        throw selectError;
      }

      // User is subscribed if record exists and unsubscribed_at is null
      const isSubscribed = subscription && !subscription.unsubscribed_at;

      return new Response(
        JSON.stringify({ 
          enabled: isSubscribed,
          email: normalizedEmail
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle POST request - update preference
    if (req.method === "POST") {
      const body: PreferenceRequest = await req.json();
      const { enabled } = body;

      if (typeof enabled !== "boolean") {
        return new Response(
          JSON.stringify({ error: "enabled must be a boolean" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log(`Marketing preference update for ${normalizedEmail}: enabled=${enabled}`);

      // Check if record exists
      const { data: existingRecord, error: selectError } = await supabaseAdmin
        .from("marketing_subscribers")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (selectError) {
        console.error("Error checking existing subscription:", selectError);
        throw selectError;
      }

      let dbResult;
      
      if (enabled) {
        // Subscribe
        if (existingRecord) {
          // Re-subscribe existing record
          dbResult = await supabaseAdmin
            .from("marketing_subscribers")
            .update({
              opted_in_at: new Date().toISOString(),
              unsubscribed_at: null,
              user_id: userId,
            })
            .eq("email", normalizedEmail)
            .select()
            .single();
        } else {
          // Create new subscription
          dbResult = await supabaseAdmin
            .from("marketing_subscribers")
            .insert({
              email: normalizedEmail,
              user_id: userId,
              source: "app-settings",
              opted_in_at: new Date().toISOString(),
            })
            .select()
            .single();
        }
      } else {
        // Unsubscribe
        if (existingRecord) {
          dbResult = await supabaseAdmin
            .from("marketing_subscribers")
            .update({
              unsubscribed_at: new Date().toISOString(),
            })
            .eq("email", normalizedEmail)
            .select()
            .single();
        } else {
          // No record exists and user wants to unsubscribe - nothing to do
          return new Response(
            JSON.stringify({ 
              success: true, 
              enabled: false,
              message: "Not subscribed to marketing emails" 
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      if (dbResult?.error) {
        console.error("Error updating marketing subscription:", dbResult.error);
        throw dbResult.error;
      }

      console.log("Database record updated successfully");

      // Sync with Resend audience if API key and audience ID are available
      if (resendApiKey && resendAudienceId) {
        try {
          if (enabled) {
            // Add/update contact as subscribed
            const resendResponse = await fetch(
              `https://api.resend.com/audiences/${resendAudienceId}/contacts`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: normalizedEmail,
                  unsubscribed: false,
                }),
              }
            );
            
            const resendData = await resendResponse.json();
            if (resendResponse.ok) {
              console.log("Resend contact subscribed:", resendData);
            } else {
              console.error("Resend API error (non-fatal):", resendData);
            }
          } else {
            // Mark contact as unsubscribed in Resend
            // Use PATCH to update existing contact
            const resendResponse = await fetch(
              `https://api.resend.com/audiences/${resendAudienceId}/contacts/${normalizedEmail}`,
              {
                method: "PATCH",
                headers: {
                  "Authorization": `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  unsubscribed: true,
                }),
              }
            );
            
            if (resendResponse.ok) {
              const resendData = await resendResponse.json();
              console.log("Resend contact unsubscribed:", resendData);
            } else {
              // Contact might not exist in Resend, which is fine
              console.log("Resend contact update skipped - contact may not exist");
            }
          }
        } catch (resendError) {
          // Log but don't fail - the DB record is the source of truth
          console.error("Resend API error (non-fatal):", resendError);
        }
      } else {
        console.log("RESEND_API_KEY or RESEND_AUDIENCE_ID not configured, skipping Resend sync");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          enabled: enabled,
          message: enabled ? "Subscribed to marketing emails" : "Unsubscribed from marketing emails"
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in marketing-preference:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
