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
    const { courseId } = await req.json();
    const apiKey = Deno.env.get('GOLF_COURSE_API_KEY');

    if (!apiKey) {
      throw new Error('Golf Course API key not configured');
    }

    console.log('Fetching course details for ID:', courseId);

    const response = await fetch(`https://api.golfcourseapi.com/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Golf Course API error:', response.status, errorText);
      throw new Error(`Golf Course API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Course details retrieved successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
