import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env, isSupabaseConfigured } from '../env';

export async function getSupabaseServer() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  });
}
