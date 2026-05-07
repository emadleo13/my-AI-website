import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isAdminConfigured } from '../env';

/**
 * Service-role Supabase client. Bypasses RLS — NEVER import from a client
 * component. Use only in server-side handlers and after verifying the caller
 * is an admin (see lib/auth.ts).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isAdminConfigured) return null;
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
