import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

// Helper to extract email domain (for logging without exposing full email)
const getEmailDomain = (email: string): string => {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : "unknown";
};

// Helper to get masked project ref from URL (e.g., "sejy…emgx")
const getMaskedProjectRef = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    const ref = hostname.split(".")[0];
    if (ref.length > 8) {
      return `${ref.slice(0, 4)}…${ref.slice(-4)}`;
    }
    return ref;
  } catch {
    return "unknown";
  }
};

// Helper to analyze link shape without exposing tokens
const analyzeLinkShape = (link: string): Record<string, boolean | string> => {
  try {
    const url = new URL(link);
    const hash = url.hash;
    const search = url.search;
    
    return {
      has_hash: hash.length > 1,
      has_query: search.length > 1,
      has_type_recovery: hash.includes("type=recovery") || search.includes("type=recovery"),
      has_access_token: hash.includes("access_token") || search.includes("access_token"),
      has_refresh_token: hash.includes("refresh_token") || search.includes("refresh_token"),
      has_code: search.includes("code="),
      redirect_path: url.pathname,
    };
  } catch {
    return { error: true };
  }
};

// Helper to create structured log entry
const logPasswordReset = (status: string, emailDomain: string, projectRef: string, details?: string) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] PASSWORD_RESET | domain: ${emailDomain} | project: ${projectRef} | status: ${status}${details ? ` | ${details}` : ""}`;
  console.log(logEntry);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const maskedRef = getMaskedProjectRef(supabaseUrl);

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      logPasswordReset("error", "unknown", maskedRef, "missing or invalid email");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailDomain = getEmailDomain(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logPasswordReset("error", emailDomain, maskedRef, "invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logPasswordReset("received", emailDomain, maskedRef, "processing request");

    // Get environment variables
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const appBaseUrl = Deno.env.get("APP_BASE_URL");

    if (!supabaseUrl || !supabaseServiceRoleKey || !resendApiKey || !appBaseUrl) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate password recovery link
    const redirectTo = `${appBaseUrl}/reset-password`;
    console.log(`Generating recovery link for domain: ${emailDomain}, redirecting to: ${redirectTo}`);

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (linkError) {
      logPasswordReset("link_error", emailDomain, maskedRef, "user may not exist");
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The generated link from Supabase
    const recoveryLink = linkData?.properties?.action_link;
    
    if (!recoveryLink) {
      logPasswordReset("link_error", emailDomain, maskedRef, "no recovery link generated");
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log link shape for debugging (no actual tokens)
    const linkShape = analyzeLinkShape(recoveryLink);
    logPasswordReset("link_generated", emailDomain, maskedRef, `link_shape: ${JSON.stringify(linkShape)}`);

    // Send email using Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">TRACKD Golf</h1>
          </div>
          
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="margin-bottom: 20px;">
            We received a request to reset your password for your TRACKD Golf account. Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${recoveryLink}" 
               style="display: inline-block; background-color: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin-bottom: 20px; word-break: break-all; color: #16a34a; font-size: 14px;">
            ${recoveryLink}
          </p>
          
          <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} TRACKD Golf. All rights reserved.
          </p>
        </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TRACKD Golf <no-reply@send.trackdgolf.com>",
        to: [email],
        subject: "Reset your TRACKD Golf password",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      logPasswordReset("email_error", emailDomain, maskedRef, `resend API failed: ${resendData?.message || "unknown"}`);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logPasswordReset("success", emailDomain, maskedRef, `email_id: ${resendData?.id || "unknown"}`);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    logPasswordReset("error", "unknown", maskedRef, `exception: ${error.message || "unknown"}`);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);