import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded demo account credentials - only this specific account can be created
const DEMO_EMAIL = 'review@trackdgolf.app';
const DEMO_PASSWORD = 'TrackdReview2026!';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

    if (existingUser) {
      console.log('Demo user already exists:', existingUser.id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Demo user already exists',
          userId: existingUser.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the demo user with email pre-confirmed
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (createError) {
      console.error('Error creating demo user:', createError);
      throw createError;
    }

    console.log('Demo user created successfully:', newUser.user?.id);

    // Create profile record for the demo user
    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          display_name: 'App Review',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw - user was created successfully
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo user created successfully',
        userId: newUser.user?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in create-demo-user:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
