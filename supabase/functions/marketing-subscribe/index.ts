import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  source?: string;
  user_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendAudienceId = Deno.env.get("RESEND_AUDIENCE_ID");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { email, source = "app", user_id }: SubscribeRequest = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Marketing subscribe request for: ${normalizedEmail}, source: ${source}`);

    // Upsert into marketing_subscribers table
    // If exists and was unsubscribed, re-subscribe by setting opted_in_at and clearing unsubscribed_at
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
      // Update existing record - re-subscribe
      dbResult = await supabase
        .from("marketing_subscribers")
        .update({
          opted_in_at: new Date().toISOString(),
          unsubscribed_at: null,
          source: source,
          user_id: user_id || existingRecord.user_id,
        })
        .eq("email", normalizedEmail)
        .select()
        .single();
    } else {
      // Insert new record
      dbResult = await supabase
        .from("marketing_subscribers")
        .insert({
          email: normalizedEmail,
          source: source,
          user_id: user_id || null,
          opted_in_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (dbResult.error) {
      console.error("Error upserting marketing subscription:", dbResult.error);
      throw dbResult.error;
    }

    console.log("Database record created/updated successfully");

    // Add to Resend audience if API key and audience ID are available
    if (resendApiKey && resendAudienceId) {
      try {
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
          console.log("Resend contact created/updated:", resendData);
        } else {
          console.error("Resend API error (non-fatal):", resendData);
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
        message: "Successfully subscribed to marketing emails",
        email: normalizedEmail 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in marketing-subscribe:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
