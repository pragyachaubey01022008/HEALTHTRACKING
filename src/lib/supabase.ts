import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uplkjguhaoqzhpcsgilu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NdTiGUYMqgEvqri1_Tgh7w_E2dVImS7';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Using provided fallback values. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Secrets panel for your own project.');
} else {
  console.log('Supabase environment variables are loaded from environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
