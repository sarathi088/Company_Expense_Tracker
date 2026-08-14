import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eigqtczztqrsiftykuhs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dwm5VtIbYmJyaXVv8rPqBw_zAom9KDD';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = () => {
  const key = SUPABASE_ANON_KEY;
  return Boolean(key) && key !== 'YOUR_SUPABASE_ANON_KEY_HERE' && key.length > 10;
};
