import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  source?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendSegmentId = Deno.env.get("RESEND_SEGMENT_ID");

    // Require authenticated caller — derive identity from JWT, never trust client-supplied email/user_id
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub || !claims.claims.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claims.claims.sub as string;
    const userEmail = claims.claims.email as string;
    const normalizedEmail = userEmail.toLowerCase().trim();

    const { source = "app" }: SubscribeRequest = await req.json().catch(() => ({}));

    const validSources = ["app", "web", "landing-page", "app-settings", "app-signup"];
    if (source && !validSources.includes(source)) {
      return new Response(
        JSON.stringify({ error: "Invalid source value" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const maskedEmail = normalizedEmail.substring(0, 2) + '***@' + normalizedEmail.split('@')[1];
    console.log(`Marketing subscribe request for: ${maskedEmail}, source: ${source}`);

    const { data: existingRecord, error: selectError } = await supabase
      .from("marketing_subscribers")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing subscription:", selectError);
      throw selectError;
    }

    let dbResult;
    if (existingRecord) {
      dbResult = await supabase
        .from("marketing_subscribers")
        .update({
          opted_in_at: new Date().toISOString(),
          unsubscribed_at: null,
          source,
          user_id: userId,
        })
        .eq("email", normalizedEmail)
        .select()
        .single();
    } else {
      dbResult = await supabase
        .from("marketing_subscribers")
        .insert({
          email: normalizedEmail,
          source,
          user_id: userId,
          opted_in_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (dbResult.error) {
      console.error("Error upserting marketing subscription:", dbResult.error);
      throw dbResult.error;
    }

    if (resendApiKey && resendSegmentId) {
      try {
        const resendResponse = await fetch("https://api.resend.com/contacts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            unsubscribed: false,
            audience_id: resendSegmentId,
          }),
        });
        const resendData = await resendResponse.json();
        if (resendResponse.ok) {
          console.log("Resend contact created/updated");
        } else {
          console.error("Resend API error (non-fatal):", resendData);
        }
      } catch (resendError) {
        console.error("Resend API error (non-fatal):", resendError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed to marketing emails" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in marketing-subscribe:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
