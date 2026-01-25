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
// TRANSFER: When subscription moves from anonymous ID to Supabase UUID
const TRIAL_START_EVENTS = ["INITIAL_PURCHASE", "RENEWAL", "TRANSFER"];

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

const LOGO_URL = "https://app.trackdgolf.com/trackd-logo.png";
const APP_URL = "https://app.trackdgolf.com";
const TERMS_URL = "https://www.trackdgolf.com/terms-of-use.pdf";
const PRIVACY_URL = "https://www.trackdgolf.com/privacy-policy.pdf";

// Email #1 — Welcome to Premium (service email, send immediately)
function getTrialConfirmationEmail(): { subject: string; html: string; text: string } {
  return {
    subject: "Welcome to TRACKD Premium ⛳️",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <img src="${LOGO_URL}" alt="TRACKD Golf" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">Hi there,</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Welcome to TRACKD Golf Premium — your free trial is now active. We are excited to have you onboard and appreciate your support.
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                To help you with the app here are two quick setup steps to get you logging scores and stats in no time;
              </p>
              
              <!-- Step 1 -->
              <div style="margin: 0 0 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #18181b;">1) Set up your bag (takes 30 seconds)</p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                  Go to Settings → My Bag and add your clubs. This ensures the correct club options appear when you're logging shots.
                </p>
              </div>
              
              <!-- Step 2 -->
              <div style="margin: 0 0 30px 0;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #18181b;">2) Choose the stats you want to track</p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                  In Settings → Stats, select the stats you care about and turn off anything you don't want to track. Less friction = better data.
                </p>
              </div>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                If you need help, just reply to this email — we'll get you sorted.
              </p>
              
              <p style="margin: 0 0 5px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">— TRACKD Golf</p>
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #71717a;">
                <a href="mailto:support@trackdgolf.com" style="color: #1a5d3a; text-decoration: none;">support@trackdgolf.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                <a href="${TERMS_URL}" style="color: #a1a1aa; text-decoration: underline;">Terms of Use</a>
                &nbsp;•&nbsp;
                <a href="${PRIVACY_URL}" style="color: #a1a1aa; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi there,

Welcome to TRACKD Golf Premium — your free trial is now active. We are excited to have you onboard and appreciate your support.

To help you with the app here are two quick setup steps to get you logging scores and stats in no time;

1) Set up your bag (takes 30 seconds)
Go to Settings → My Bag and add your clubs. This ensures the correct club options appear when you're logging shots.

2) Choose the stats you want to track
In Settings → Stats, select the stats you care about and turn off anything you don't want to track. Less friction = better data.

If you need help, just reply to this email — we'll get you sorted.

— TRACKD Golf
support@trackdgolf.com`,
  };
}

// Email #2 — Day 14 Check-in (marketing email, only if opt-in)
function getCheckInEmail(): { subject: string; html: string; text: string } {
  return {
    subject: "How's your tracking going? (Quick check-in)",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <img src="${LOGO_URL}" alt="TRACKD Golf" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">Hi there,</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                You're about two weeks into Premium — quick check-in: have you tracked at least 2 rounds yet? That's usually the point where the trends start to become obvious.
              </p>
              
              <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #18181b;">One tip to improve faster:</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                After each round, spend 30 seconds looking at one stat you want to move next round (e.g., Fairways, GIR, or Scrambles). Then set a single intention for your next round.
              </p>
              
              <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #18181b;">Make sure your setup is still dialled:</p>
              <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 16px; line-height: 28px; color: #3f3f46;">
                <li>Settings → My Bag: are your clubs accurate?</li>
                <li>Settings → Stats: are you tracking only what matters to you?</li>
              </ul>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                If you tell us what you're trying to improve (breaking 90, more GIR, fewer doubles), we'll suggest some drills from our local pro to help you.
              </p>
              
              <p style="margin: 0 0 5px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">— TRACKD Golf</p>
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #71717a;">
                <a href="mailto:support@trackdgolf.com" style="color: #1a5d3a; text-decoration: none;">support@trackdgolf.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                <a href="${APP_URL}/settings" style="color: #a1a1aa; text-decoration: underline;">Manage email preferences</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                <a href="${TERMS_URL}" style="color: #a1a1aa; text-decoration: underline;">Terms of Use</a>
                &nbsp;•&nbsp;
                <a href="${PRIVACY_URL}" style="color: #a1a1aa; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi there,

You're about two weeks into Premium — quick check-in: have you tracked at least 2 rounds yet? That's usually the point where the trends start to become obvious.

One tip to improve faster:
After each round, spend 30 seconds looking at one stat you want to move next round (e.g., Fairways, GIR, or Scrambles). Then set a single intention for your next round.

Make sure your setup is still dialled:
• Settings → My Bag: are your clubs accurate?
• Settings → Stats: are you tracking only what matters to you?

If you tell us what you're trying to improve (breaking 90, more GIR, fewer doubles), we'll suggest some drills from our local pro to help you.

— TRACKD Golf
support@trackdgolf.com

Manage email preferences: ${APP_URL}/settings`,
  };
}

// Email #3 — Trial ending in 3 days (service email)
function getTrialEndingEmail(): { subject: string; html: string; text: string } {
  return {
    subject: "Your Premium trial ends in 3 days",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <img src="${LOGO_URL}" alt="TRACKD Golf" width="140" style="max-width: 140px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">Hi there,</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                A quick reminder that your TRACKD Golf Premium trial is due to end in 3 days.
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                After the trial, your subscription will automatically continue at the standard price unless you cancel.
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                If you don't want to be charged, please cancel at least 24 hours before the trial ends (Apple requires this window).
              </p>
              
              <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #18181b;">You can manage or cancel your subscription here:</p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                iPhone/iPad: Settings → Apple ID → Subscriptions → TRACKD Golf
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">
                Need a hand or have questions? Just reply and we'll help.
              </p>
              
              <p style="margin: 0 0 5px 0; font-size: 16px; line-height: 24px; color: #3f3f46;">— TRACKD Golf</p>
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #71717a;">
                <a href="mailto:support@trackdgolf.com" style="color: #1a5d3a; text-decoration: none;">support@trackdgolf.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                <a href="${TERMS_URL}" style="color: #a1a1aa; text-decoration: underline;">Terms of Use</a>
                &nbsp;•&nbsp;
                <a href="${PRIVACY_URL}" style="color: #a1a1aa; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi there,

A quick reminder that your TRACKD Golf Premium trial is due to end in 3 days.

After the trial, your subscription will automatically continue at the standard price unless you cancel.

If you don't want to be charged, please cancel at least 24 hours before the trial ends (Apple requires this window).

You can manage or cancel your subscription here:
iPhone/iPad: Settings → Apple ID → Subscriptions → TRACKD Golf

Need a hand or have questions? Just reply and we'll help.

— TRACKD Golf
support@trackdgolf.com`,
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const startTime = Date.now();
  const logContext = {
    timestamp: new Date().toISOString(),
    function: "revenuecat-webhook",
  };

  // ============================================
  // HEALTH CHECK: GET /revenuecat-webhook/health
  // ============================================
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    console.log({ ...logContext, action: "health-check", status: "ok" });
    return new Response(JSON.stringify({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "RevenueCat webhook is reachable"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // TEST TRIGGER: POST /revenuecat-webhook/test
  // Simulates an INITIAL_PURCHASE trial event
  // ============================================
  if (req.method === "POST" && url.pathname.endsWith("/test")) {
    const testSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    const authHeader = req.headers.get("Authorization");
    
    if (!testSecret || authHeader !== `Bearer ${testSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const testEmail = body.email;
      
      if (!testEmail) {
        return new Response(JSON.stringify({ error: "Missing 'email' in request body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log({ ...logContext, action: "test-trigger", email: testEmail });

      const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
      
      // Send all 3 email templates as a test
      const email1 = getTrialConfirmationEmail();
      const email2 = getCheckInEmail();
      const email3 = getTrialEndingEmail();

      const result1 = await sendEmail(resendApiKey, { to: testEmail, ...email1 });
      const result2 = await sendEmail(resendApiKey, { to: testEmail, ...email2 });
      const result3 = await sendEmail(resendApiKey, { to: testEmail, ...email3 });

      console.log({ 
        ...logContext, 
        action: "test-emails-sent", 
        email1: result1.id || result1.error,
        email2: result2.id || result2.error,
        email3: result3.id || result3.error,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Test emails sent",
        results: {
          trialConfirmation: result1,
          checkIn: result2,
          trialEnding: result3,
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error({ ...logContext, action: "test-trigger-error", error: String(err) });
      return new Response(JSON.stringify({ error: "Test trigger failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

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
    
    // Detect anonymous vs identified users
    const appUserId = event.app_user_id || "";
    const originalAppUserId = event.original_app_user_id || "";
    const isAnonymousUser = appUserId.startsWith("$RCAnonymousID") || originalAppUserId.startsWith("$RCAnonymousID");
    
    // Safe masked user ID for logging (first 8 chars or "anonymous")
    const maskedUserId = isAnonymousUser 
      ? "anonymous-" + (originalAppUserId || appUserId).substring(0, 12)
      : (originalAppUserId || appUserId).substring(0, 8) + "...";
    
    // Log event details without PII - ALWAYS log for debugging
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
      maskedUserId,
      isAnonymousUser,
    });
    
    // Warn about anonymous users - this is a problem for email linking
    if (isAnonymousUser) {
      console.warn({
        ...logContext,
        warning: "ANONYMOUS_USER_DETECTED",
        message: "Purchase made with anonymous user ID - webhook cannot link to Supabase user",
        appUserId: appUserId.substring(0, 20) + "...",
        originalAppUserId: originalAppUserId.substring(0, 20) + "...",
        recommendation: "Ensure Purchases.logIn(supabaseUserId) is called before purchase",
      });
    }

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

    // For TRANSFER events, use app_user_id (the NEW owner/Supabase UUID)
    // For other events, use original_app_user_id (or fall back to app_user_id)
    const isTransferEvent = event.type === "TRANSFER";
    const userId = isTransferEvent 
      ? event.app_user_id   // TRANSFER: new owner (Supabase UUID)
      : (event.original_app_user_id || event.app_user_id);
    
    // Log transfer event details for debugging
    if (isTransferEvent) {
      console.log({
        ...logContext,
        action: "transfer-event-detected",
        fromUserId: (event.original_app_user_id || "").substring(0, 12) + "...",
        toUserId: (event.app_user_id || "").substring(0, 8) + "...",
        message: "Using app_user_id (new owner) for email lookup",
      });
    }
    
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
      const email1Template = getTrialConfirmationEmail();
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
        const email2Template = getCheckInEmail();
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
      const email3Template = getTrialEndingEmail();
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
