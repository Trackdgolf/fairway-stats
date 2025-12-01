import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const apiKey = Deno.env.get('GOLF_COURSE_API_KEY');

    if (!apiKey) {
      throw new Error('Golf Course API key not configured');
    }

    console.log('Searching courses with query:', query);
    console.log('API key present:', apiKey ? 'Yes' : 'No');
    console.log('API key length:', apiKey?.length);

    const response = await fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Key ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Golf Course API error:', response.status, errorText);
      throw new Error(`Golf Course API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Found courses:', data.courses?.length || 0);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
