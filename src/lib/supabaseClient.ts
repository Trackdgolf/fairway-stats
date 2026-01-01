import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { CapacitorStorage } from './capacitorStorage';
import { supabase as webSupabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

let nativeSupabase: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!Capacitor.isNativePlatform()) {
    return webSupabase;
  }
  
  if (!nativeSupabase) {
    nativeSupabase = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          storage: CapacitorStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      }
    );
  }
  
  return nativeSupabase;
};
