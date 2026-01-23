import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_BASE = "https://api.resend.com";

// Allowlisted email domains for sandbox testing
const SANDBOX_ALLOWED_DOMAINS = ["trackdgolf.app", "trackdgolf.com"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to send emails via Resend API
async function sendEmail(
  apiKey: string,
  options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    scheduled_at?: string;
  }
): Promise<{ id?: string; error?: string }> {
  const response = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TRACKD Golf <no-reply@send.trackdgolf.com>",
      reply_to: "support@trackdgolf.com",
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(options.scheduled_at && { scheduled_at: options.scheduled_at }),
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    return { error: data.message || "Failed to send email" };
  }
  
  return { id: data.id };
}

// Check if email domain is allowed for sandbox
function isEmailAllowedForSandbox(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return SANDBOX_ALLOWED_DOMAINS.includes(domain);
}

// RevenueCat webhook event types we care about
const TRIAL_START_EVENTS = ["INITIAL_PURCHASE", "RENEWAL"];

interface RevenueCatEvent {
  event: {
    id: string;
    type: string;
    app_user_id: string;
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: string; // "TRIAL" | "NORMAL" | "INTRO"
    purchased_at_ms: number;
    expiration_at_ms: number;
    store: string;
    environment: string; // "SANDBOX" | "PRODUCTION"
    is_trial_conversion?: boolean;
    transaction_id?: string;
  };
  api_version: string;
}

// Email template functions
function getTrialConfirmationEmail(email: string): { subject: string; html: string; text: string } {
  return {
    subject: "Welcome to TRACKD Premium! 🎯",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://app.trackdgolf.com/trackd-logo.png" alt="TRACKD Golf" style="width: 140px; height: auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 28px; font-weight: 700;">Your Premium Trial Has Started! 🎉</h1>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Welcome to TRACKD Premium! You now have full access to all our advanced features for the next 4 weeks.
              </p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 15px; color: #166534; font-size: 18px;">Quick Start Tips:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                  <li><strong>Track every shot</strong> – Fairways, greens, putts, and club selection</li>
                  <li><strong>Analyze your trends</strong> – View dispersion patterns and scoring insights</li>
                  <li><strong>Customize your bag</strong> – Set up your clubs for accurate tracking</li>
                  <li><strong>Watch your handicap</strong> – See your TRACKD Handicap evolve</li>
                </ul>
              </div>
              
              <p style="margin: 25px 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ready to start improving your game?
              </p>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="https://app.trackdgolf.com" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Open TRACKD</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 14px;">
                Your trial ends in 4 weeks. We'll remind you before it converts to a paid subscription.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; text-align: center;">
                Questions? Reply to this email or contact us at support@trackdgolf.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                <a href="https://www.trackdgolf.com/privacy-policy.pdf" style="color: #9ca3af;">Privacy Policy</a> • 
                <a href="https://www.trackdgolf.com/terms-of-use.pdf" style="color: #9ca3af;">Terms of Use</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Welcome to TRACKD Premium! 🎉

Your Premium trial has started! You now have full access to all our advanced features for the next 4 weeks.

Quick Start Tips:
- Track every shot – Fairways, greens, putts, and club selection
- Analyze your trends – View dispersion patterns and scoring insights
- Customize your bag – Set up your clubs for accurate tracking
- Watch your handicap – See your TRACKD Handicap evolve

Open the app: https://app.trackdgolf.com

Your trial ends in 4 weeks. We'll remind you before it converts to a paid subscription.

Questions? Contact us at support@trackdgolf.com`,
  };
}

function getCheckInEmail(email: string): { subject: string; html: string; text: string } {
  return {
    subject: "How's your golf game going? 🏌️",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://app.trackdgolf.com/trackd-logo.png" alt="TRACKD Golf" style="width: 140px; height: auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 26px; font-weight: 700;">Two Weeks In – How's It Going?</h1>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You're halfway through your Premium trial! We hope you're finding valuable insights in your game data.
              </p>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px; color: #1e40af; font-size: 16px;">💡 Pro Tip: Check Your Dispersion Patterns</h3>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                  After a few rounds, your fairway and green dispersion charts reveal your shot tendencies. Use them to identify if you're consistently missing left, right, short, or long – then adjust your aim or club selection accordingly.
                </p>
              </div>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="https://app.trackdgolf.com/stats" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Stats</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 14px;">
                2 weeks remaining in your trial.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; text-align: center;">
                Questions? Reply to this email or contact us at support@trackdgolf.com
              </p>
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 12px; text-align: center;">
                <a href="https://app.trackdgolf.com/settings" style="color: #9ca3af;">Manage email preferences</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                <a href="https://www.trackdgolf.com/privacy-policy.pdf" style="color: #9ca3af;">Privacy Policy</a> • 
                <a href="https://www.trackdgolf.com/terms-of-use.pdf" style="color: #9ca3af;">Terms of Use</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Two Weeks In – How's It Going?

You're halfway through your Premium trial! We hope you're finding valuable insights in your game data.

💡 Pro Tip: Check Your Dispersion Patterns
After a few rounds, your fairway and green dispersion charts reveal your shot tendencies. Use them to identify if you're consistently missing left, right, short, or long – then adjust your aim or club selection accordingly.

View your stats: https://app.trackdgolf.com/stats

2 weeks remaining in your trial.

Questions? Contact us at support@trackdgolf.com
Manage email preferences: https://app.trackdgolf.com/settings`,
  };
}

function getTrialEndingEmail(email: string, trialEndDate: string): { subject: string; html: string; text: string } {
  return {
    subject: "Your Premium trial ends in 3 days ⏰",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px 40px; text-align: center;">
              <img src="https://app.trackdgolf.com/trackd-logo.png" alt="TRACKD Golf" style="width: 140px; height: auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 26px; font-weight: 700;">Your Trial Ends in 3 Days</h1>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your TRACKD Premium trial ends on <strong>${trialEndDate}</strong>.
              </p>
              
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px; color: #a16207; font-size: 16px;">⚠️ Important</h3>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                  After your trial ends, your subscription will automatically convert to a paid plan. If you don't want to be charged, <strong>cancel at least 24 hours before the trial ends</strong>.
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To manage or cancel your subscription, open the app and go to <strong>Settings → Subscription</strong>, or manage it directly through the App Store.
              </p>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="https://app.trackdgolf.com/settings" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Manage Subscription</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We hope you've enjoyed tracking your rounds with TRACKD Premium! If you have any questions about your subscription, we're here to help.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; text-align: center;">
                Questions? Reply to this email or contact us at support@trackdgolf.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                <a href="https://www.trackdgolf.com/privacy-policy.pdf" style="color: #9ca3af;">Privacy Policy</a> • 
                <a href="https://www.trackdgolf.com/terms-of-use.pdf" style="color: #9ca3af;">Terms of Use</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Your Trial Ends in 3 Days

Your TRACKD Premium trial ends on ${trialEndDate}.

⚠️ Important
After your trial ends, your subscription will automatically convert to a paid plan. If you don't want to be charged, cancel at least 24 hours before the trial ends.

To manage or cancel your subscription, open the app and go to Settings → Subscription, or manage it directly through the App Store.

Manage subscription: https://app.trackdgolf.com/settings

We hope you've enjoyed tracking your rounds with TRACKD Premium! If you have any questions about your subscription, we're here to help.

Questions? Contact us at support@trackdgolf.com`,
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const logContext = {
    timestamp: new Date().toISOString(),
    function: "revenuecat-webhook",
  };

  try {
    // ============================================
    // 1) SECURITY: Validate Authorization header
    // ============================================
    const authHeader = req.headers.get("Authorization");
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      console.error({ ...logContext, error: "REVENUECAT_WEBHOOK_SECRET not configured" });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exact match: "Bearer " + secret
    const expectedAuth = `Bearer ${webhookSecret}`;
    const authorized = authHeader === expectedAuth;
    
    if (!authorized) {
      console.error({ 
        ...logContext, 
        authorized: false,
        error: "Invalid or missing authorization header",
        headerPresent: !!authHeader,
      });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // 2) Parse payload and log safely (no PII)
    // ============================================
    const payload: RevenueCatEvent = await req.json();
    const event = payload.event;
    const environment = event.environment || "UNKNOWN";
    const isSandbox = environment === "SANDBOX";
    
    // Log event details without PII
    console.log({
      ...logContext,
      authorized: true,
      environment,
      eventType: event.type,
      eventId: event.id,
      transactionId: event.transaction_id || null,
      periodType: event.period_type,
      store: event.store,
      productId: event.product_id,
    });

    // ============================================
    // 3) Filter: Only process trial start events
    // ============================================
    if (!TRIAL_START_EVENTS.includes(event.type)) {
      console.log({ ...logContext, action: "ignored", reason: "non-trial-event", eventType: event.type });
      return new Response(JSON.stringify({ success: true, message: "Event ignored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.period_type !== "TRIAL") {
      console.log({ ...logContext, action: "ignored", reason: "non-trial-period", periodType: event.period_type });
      return new Response(JSON.stringify({ success: true, message: "Not a trial" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.is_trial_conversion) {
      console.log({ ...logContext, action: "ignored", reason: "trial-conversion" });
      return new Response(JSON.stringify({ success: true, message: "Trial conversion ignored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // 4) Initialize clients
    // ============================================
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const userId = event.original_app_user_id || event.app_user_id;
    const trialStartAt = new Date(event.purchased_at_ms);
    const trialEndAt = new Date(event.expiration_at_ms);

    // ============================================
    // 5) IDEMPOTENCY: Check if already processed
    // ============================================
    const { data: existingRecord } = await supabase
      .from("premium_lifecycle_emails")
      .select("id, last_rc_event_id, email1_sent_at")
      .eq("rc_app_user_id", userId)
      .eq("trial_start_at", trialStartAt.toISOString())
      .maybeSingle();

    // If we already processed this exact event OR already sent emails for this trial
    if (existingRecord) {
      if (existingRecord.last_rc_event_id === event.id) {
        console.log({ ...logContext, action: "skipped", reason: "duplicate-event-id", eventId: event.id });
        return new Response(JSON.stringify({ success: true, message: "Already processed" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Already processed this trial (different event ID but same user + trial start)
      if (existingRecord.email1_sent_at) {
        console.log({ 
          ...logContext, 
          action: "skipped", 
          reason: "trial-already-processed",
          existingRecordId: existingRecord.id,
        });
        // Update the last event ID to track this retry
        await supabase
          .from("premium_lifecycle_emails")
          .update({ last_rc_event_id: event.id })
          .eq("id", existingRecord.id);
        
        return new Response(JSON.stringify({ success: true, message: "Trial already processed" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============================================
    // 6) Get user email from auth.users
    // ============================================
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user?.email) {
      console.error({ ...logContext, error: "user-not-found", userId: userId.substring(0, 8) + "..." });
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = userData.user.email;
    const emailDomain = userEmail.split("@")[1] || "unknown";
    
    // ============================================
    // 7) ENVIRONMENT HANDLING: Sandbox email gating
    // ============================================
    const allowSandboxEmails = Deno.env.get("ALLOW_SANDBOX_EMAILS") === "true";
    const emailAllowedForSandbox = isEmailAllowedForSandbox(userEmail);
    
    // Determine if we should actually send emails
    let shouldSendEmails = true;
    let sandboxEmailReason = "";
    
    if (isSandbox) {
      if (allowSandboxEmails) {
        shouldSendEmails = true;
        sandboxEmailReason = "ALLOW_SANDBOX_EMAILS=true";
      } else if (emailAllowedForSandbox) {
        shouldSendEmails = true;
        sandboxEmailReason = "allowlisted-domain";
      } else {
        shouldSendEmails = false;
        sandboxEmailReason = "sandbox-blocked";
      }
    }
    
    console.log({ 
      ...logContext, 
      action: "processing-trial",
      environment,
      isSandbox,
      shouldSendEmails,
      sandboxEmailReason: isSandbox ? sandboxEmailReason : "n/a",
      emailDomain, // Log domain only, not full email
    });

    // ============================================
    // 8) Check marketing opt-in for Email #2
    // ============================================
    const { data: marketingSub } = await supabase
      .from("marketing_subscribers")
      .select("id, unsubscribed_at")
      .eq("user_id", userId)
      .maybeSingle();
    
    const hasMarketingOptIn = marketingSub && !marketingSub.unsubscribed_at;
    console.log({ ...logContext, hasMarketingOptIn });

    // ============================================
    // 9) Calculate schedule dates
    // ============================================
    const email2ScheduleDate = new Date(trialStartAt.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days
    const email3ScheduleDate = new Date(trialEndAt.getTime() - 3 * 24 * 60 * 60 * 1000); // -3 days from end

    const trialEndFormatted = trialEndAt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // ============================================
    // 10) Prepare record data
    // ============================================
    const recordData: Record<string, any> = {
      user_id: userId,
      rc_app_user_id: userId,
      trial_start_at: trialStartAt.toISOString(),
      trial_end_at: trialEndAt.toISOString(),
      last_rc_event_id: event.id,
    };

    // ============================================
    // 11) SEND/SCHEDULE EMAILS
    // ============================================
    
    // --- Email #1: Send immediately ---
    if (shouldSendEmails) {
      const email1Template = getTrialConfirmationEmail(userEmail);
      try {
        const email1Result = await sendEmail(resendApiKey, {
          to: userEmail,
          subject: email1Template.subject,
          html: email1Template.html,
          text: email1Template.text,
        });
        
        if (email1Result.id) {
          recordData.email1_sent_at = new Date().toISOString();
          console.log({ ...logContext, action: "email1-sent", resendEmailId: email1Result.id });
        } else {
          console.error({ ...logContext, action: "email1-failed", error: email1Result.error });
        }
      } catch (emailError: any) {
        console.error({ ...logContext, action: "email1-error", error: emailError.message });
      }
    } else {
      console.log({ ...logContext, action: "email1-skipped", reason: sandboxEmailReason });
      // Still mark as "sent" for idempotency tracking in sandbox
      recordData.email1_sent_at = new Date().toISOString();
    }

    // --- Email #2: Schedule for +14 days (only if marketing opt-in) ---
    if (hasMarketingOptIn) {
      if (shouldSendEmails) {
        const email2Template = getCheckInEmail(userEmail);
        try {
          const email2Result = await sendEmail(resendApiKey, {
            to: userEmail,
            subject: email2Template.subject,
            html: email2Template.html,
            text: email2Template.text,
            scheduled_at: email2ScheduleDate.toISOString(),
          });
          
          if (email2Result.id) {
            recordData.email2_resend_email_id = email2Result.id;
            recordData.email2_scheduled_for = email2ScheduleDate.toISOString();
            console.log({ 
              ...logContext, 
              action: "email2-scheduled", 
              resendEmailId: email2Result.id,
              scheduledFor: email2ScheduleDate.toISOString(),
            });
          } else {
            console.error({ ...logContext, action: "email2-failed", error: email2Result.error });
          }
        } catch (emailError: any) {
          console.error({ ...logContext, action: "email2-error", error: emailError.message });
        }
      } else {
        console.log({ ...logContext, action: "email2-skipped", reason: sandboxEmailReason });
        recordData.email2_scheduled_for = email2ScheduleDate.toISOString();
      }
    } else {
      console.log({ ...logContext, action: "email2-skipped", reason: "no-marketing-opt-in" });
    }

    // --- Email #3: Schedule for trial_end - 3 days (always send - service email) ---
    if (shouldSendEmails) {
      const email3Template = getTrialEndingEmail(userEmail, trialEndFormatted);
      try {
        const email3Result = await sendEmail(resendApiKey, {
          to: userEmail,
          subject: email3Template.subject,
          html: email3Template.html,
          text: email3Template.text,
          scheduled_at: email3ScheduleDate.toISOString(),
        });
        
        if (email3Result.id) {
          recordData.email3_resend_email_id = email3Result.id;
          recordData.email3_scheduled_for = email3ScheduleDate.toISOString();
          console.log({ 
            ...logContext, 
            action: "email3-scheduled", 
            resendEmailId: email3Result.id,
            scheduledFor: email3ScheduleDate.toISOString(),
          });
        } else {
          console.error({ ...logContext, action: "email3-failed", error: email3Result.error });
        }
      } catch (emailError: any) {
        console.error({ ...logContext, action: "email3-error", error: emailError.message });
      }
    } else {
      console.log({ ...logContext, action: "email3-skipped", reason: sandboxEmailReason });
      recordData.email3_scheduled_for = email3ScheduleDate.toISOString();
    }

    // ============================================
    // 12) Upsert lifecycle record
    // ============================================
    const { error: upsertError } = await supabase
      .from("premium_lifecycle_emails")
      .upsert(recordData, {
        onConflict: "user_id,trial_start_at",
      });

    if (upsertError) {
      console.error({ ...logContext, action: "upsert-failed", error: upsertError.message });
    }

    const duration = Date.now() - startTime;
    console.log({ 
      ...logContext, 
      action: "webhook-complete",
      durationMs: duration,
      environment,
      email1Sent: !!recordData.email1_sent_at,
      email2Scheduled: !!recordData.email2_resend_email_id || !!recordData.email2_scheduled_for,
      email3Scheduled: !!recordData.email3_resend_email_id || !!recordData.email3_scheduled_for,
    });

    return new Response(
      JSON.stringify({
        success: true,
        environment,
        email1Sent: !!recordData.email1_sent_at,
        email2Scheduled: !!recordData.email2_resend_email_id,
        email3Scheduled: !!recordData.email3_resend_email_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error({ ...logContext, action: "error", error: error.message });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
