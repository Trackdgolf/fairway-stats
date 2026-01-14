import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    // Validate authorization - must be service role key (from database trigger)
    const authHeader = req.headers.get("authorization");
    const expectedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!authHeader || !authHeader.includes(expectedKey || "")) {
      console.error("Unauthorized request - missing or invalid service role key");
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
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b;">
                Welcome to TRACKD Golf! ⛳
              </h1>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Thanks for joining TRACKD Golf. You're now ready to start tracking your rounds and improving your game with data-driven insights.
              </p>
            </td>
          </tr>
          
          <!-- Quick Start Steps -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #18181b;">
                Quick Start Guide
              </h2>
              
              <!-- Step 1 -->
              <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #22c55e; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">1</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 12px;">
                    <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #18181b;">Track Your Rounds</h3>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">Log scores, fairways hit, greens in regulation, and club selections for each hole.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Step 2 -->
              <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #22c55e; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">2</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 12px;">
                    <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #18181b;">Analyze Your Stats</h3>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">View detailed statistics and dispersion charts to understand your strengths and weaknesses.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Step 3 -->
              <table role="presentation" style="width: 100%; margin-bottom: 0;">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #22c55e; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">3</div>
                  </td>
                  <td style="vertical-align: top; padding-left: 12px;">
                    <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #18181b;">Improve Your Game</h3>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">Use your data to make smarter decisions on the course and track your improvement over time.</p>
                  </td>
                </tr>
              </table>
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
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #71717a;">
                Need help getting started? Our support team is here for you.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">
                <a href="mailto:support@trackdgolf.com" style="color: #22c55e; text-decoration: none; font-weight: 500;">support@trackdgolf.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                <a href="https://trackdgolf.com/terms" style="color: #a1a1aa; text-decoration: underline;">Terms of Service</a>
                &nbsp;•&nbsp;
                <a href="https://trackdgolf.com/privacy" style="color: #a1a1aa; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                © ${new Date().getFullYear()} TRACKD Golf. All rights reserved.
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

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TRACKD Golf <no-reply@send.trackdgolf.com>",
        to: [email],
        subject: "Welcome to TRACKD Golf",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: resendData.message || "Failed to send email" }),
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
