import { env } from './env';
import { getSupabaseServer } from './supabase/server';

/**
 * Returns the current authenticated user, or null if not signed in.
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the current user if their email is in the ADMIN_EMAILS allowlist,
 * otherwise null. Use in server components / server actions to gate admin
 * functionality before touching the service-role Supabase client.
 */
export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  if (!env.adminEmails.includes(user.email.toLowerCase())) return null;
  return user;
}
