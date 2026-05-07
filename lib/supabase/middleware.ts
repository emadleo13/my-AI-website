import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '../env';

export interface SessionResult {
  response: NextResponse | null;
  user: User | null;
}

/**
 * Refresh the Supabase session cookies on every request, and surface the
 * current user so the middleware can gate protected routes without a second
 * round-trip.
 */
export async function updateSupabaseSession(
  req: NextRequest,
): Promise<SessionResult> {
  if (!isSupabaseConfigured) return { response: null, user: null };

  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        response = NextResponse.next({ request: req });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
