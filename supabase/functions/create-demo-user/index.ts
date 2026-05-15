import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

const DEMO_EMAIL = 'review@trackdgolf.app';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require internal-secret header so this admin endpoint is not callable by the public.
    const internalSecret = Deno.env.get('INTERNAL_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-internal-secret');
    if (!internalSecret || providedSecret !== internalSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Targeted lookup instead of scanning the full user list
    const { data: existingByEmail } = await supabaseAdmin.auth.admin
      // @ts-expect-error - getUserByEmail is available on admin client
      .getUserByEmail?.(DEMO_EMAIL) ?? { data: null };

    let existingUser = existingByEmail?.user ?? null;
    if (!existingUser) {
      // Fallback: paginated scan rather than fetching everything at once
      const { data: page } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
      existingUser = page?.users?.find((u) => u.email === DEMO_EMAIL) ?? null;
    }

    if (existingUser) {
      console.log('Demo user already exists');
      return new Response(
        JSON.stringify({ success: true, message: 'Demo user already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const demoPassword = Deno.env.get('DEMO_ACCOUNT_PASSWORD');
    if (!demoPassword) {
      console.error('DEMO_ACCOUNT_PASSWORD secret is not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Demo account is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: demoPassword,
      email_confirm: true,
    });

    if (createError) {
      console.error('Error creating demo user:', createError);
      throw createError;
    }

    console.log('Demo user created successfully');

    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ id: newUser.user.id, display_name: 'App Review' });
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Demo user created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in create-demo-user:', message);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
