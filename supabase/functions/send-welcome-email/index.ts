import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate internal secret header (from database trigger)
    const internalSecret = req.headers.get("x-internal-secret");
    const expectedSecret = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
    
    if (!internalSecret || internalSecret !== expectedSecret) {
      console.error("Unauthorized request - invalid internal secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email }: WelcomeEmailRequest = await req.json();

    if (!email) {
      console.error("Missing email in request body");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending welcome email to: ${email}`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const logoUrl = "https://app.trackdgolf.com/trackd-logo.png";
    const appUrl = "https://app.trackdgolf.com";
    const termsUrl = "https://www.trackdgolf.com/terms-of-use.pdf";
    const privacyUrl = "https://www.trackdgolf.com/privacy-policy.pdf";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TRACKD Golf</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <img src="${logoUrl}" alt="TRACKD Golf" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 20px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b;">
                Welcome to TRACKD Golf ⛳️
              </h1>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #3f3f46; text-align: center;">
                You're all set — here's the fastest way to get value from your first round.
              </p>
            </td>
          </tr>
          
          <!-- Quick Start Steps -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #18181b;">
                Get started in 60 seconds
              </h2>
              
              <!-- Step 1 -->
              <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #1a5d3a; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">1</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 12px;">
                    <p style="margin: 0; font-size: 15px; line-height: 22px; color: #3f3f46;">Start a round and track scores + key stats (fairways, GIR, putts).</p>
                  </td>
                </tr>
              </table>
              
              <!-- Step 2 -->
              <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #1a5d3a; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">2</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 12px;">
                    <p style="margin: 0; font-size: 15px; line-height: 22px; color: #3f3f46;">Add club selections when you can — it improves your insights over time.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Step 3 -->
              <table role="presentation" style="width: 100%; margin-bottom: 0;">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #1a5d3a; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">3</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 12px;">
                    <p style="margin: 0; font-size: 15px; line-height: 22px; color: #3f3f46;">Review your stats after the round to spot the easiest wins.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 40px 40px; text-align: center;">
              <a href="${appUrl}" style="display: inline-block; background-color: #1a5d3a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">Open TRACKD Golf</a>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 0;">
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #71717a; text-align: center;">
                Need a hand? Reply to this email or reach us at <a href="mailto:support@trackdgolf.com" style="color: #1a5d3a; text-decoration: none;">support@trackdgolf.com</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                <a href="${termsUrl}" style="color: #a1a1aa; text-decoration: underline;">Terms of Use</a>
                &nbsp;•&nbsp;
                <a href="${privacyUrl}" style="color: #a1a1aa; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2026 TRACKD Golf. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailText = `Welcome to TRACKD Golf ⛳️

You're all set — here's the fastest way to get value from your first round.

Get started in 60 seconds:
1) Start a round and track scores + key stats (fairways, GIR, putts).
2) Add club selections when you can — it improves your insights over time.
3) Review your stats after the round to spot the easiest wins.

Open TRACKD Golf: ${appUrl}

Need a hand? Reply to this email or contact support@trackdgolf.com

Terms of Use: ${termsUrl}
Privacy Policy: ${privacyUrl}

© 2026 TRACKD Golf. All rights reserved.`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TRACKD Golf <no-reply@send.trackdgolf.com>",
        reply_to: "support@trackdgolf.com",
        to: [email],
        subject: "Welcome to TRACKD Golf ⛳️",
        html: emailHtml,
        text: emailText,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Welcome email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
