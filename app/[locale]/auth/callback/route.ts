import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { stripLocalePrefix } from '@/lib/i18n';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const rawNext = url.searchParams.get('next');

  // /en/auth/callback — extract the locale prefix.
  const localeMatch = url.pathname.match(/^\/([^/]+)\/auth\/callback/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : '/en';

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL(`${localePrefix}/auth`, url.origin));
  }

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  // `next` may be `/en/dashboard` (from middleware) or `/dashboard` (from a
  // hand-crafted link). Normalize to a locale-relative path before re-prefixing.
  const target = stripLocalePrefix(rawNext) ?? '/dashboard';
  return NextResponse.redirect(new URL(`${localePrefix}${target}`, url.origin));
}
