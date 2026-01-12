import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the user's JWT to verify authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client for verifying the user's JWT
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Create admin client with service role for data deletion and auth user deletion
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user data from all tables (in correct order due to foreign keys)
    // 1. First get all round IDs for this user
    const { data: userRounds } = await supabaseAdmin
      .from('rounds')
      .select('id')
      .eq('user_id', userId);

    if (userRounds && userRounds.length > 0) {
      const roundIds = userRounds.map(r => r.id);
      const { error: holeStatsDeleteError } = await supabaseAdmin
        .from('hole_stats')
        .delete()
        .in('round_id', roundIds);
      
      if (holeStatsDeleteError) {
        console.error('Error deleting hole_stats:', holeStatsDeleteError);
      } else {
        console.log(`Deleted hole_stats for ${roundIds.length} rounds`);
      }
    }

    // 2. Delete rounds
    const { error: roundsError } = await supabaseAdmin
      .from('rounds')
      .delete()
      .eq('user_id', userId);
    
    if (roundsError) {
      console.error('Error deleting rounds:', roundsError);
    } else {
      console.log('Deleted rounds');
    }

    // 3. Delete in_progress_rounds
    const { error: inProgressError } = await supabaseAdmin
      .from('in_progress_rounds')
      .delete()
      .eq('user_id', userId);
    
    if (inProgressError) {
      console.error('Error deleting in_progress_rounds:', inProgressError);
    } else {
      console.log('Deleted in_progress_rounds');
    }

    // 4. Delete user_preferences
    const { error: preferencesError } = await supabaseAdmin
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);
    
    if (preferencesError) {
      console.error('Error deleting user_preferences:', preferencesError);
    } else {
      console.log('Deleted user_preferences');
    }

    // 5. Delete subscriptions
    const { error: subscriptionsError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError);
    } else {
      console.log('Deleted subscriptions');
    }

    // 6. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    } else {
      console.log('Deleted profile');
    }

    // 7. Delete the auth user (must be done last)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete auth user', details: authDeleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error during account deletion:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
