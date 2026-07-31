import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const rawUrl = metaEnv.VITE_SUPABASE_URL || 'https://ouzubxsvgwfbaskhrwqi.supabase.co';
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '');
export const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91enVieHN2Z3dmYmFza2hyd3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTU0MDUsImV4cCI6MjEwMTA3MTQwNX0.32-H19Dz1h3jr0MLG6lLbBUkb4O9Up4ohQvSSjFD8c0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
