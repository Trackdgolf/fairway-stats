-- Add SUPABASE_URL to vault for the database trigger
SELECT vault.create_secret(
  'https://sejyshsgioedwhkqemgx.supabase.co',
  'SUPABASE_URL',
  'Supabase project URL for internal webhook calls'
);