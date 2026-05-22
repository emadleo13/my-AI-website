import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n-routing';
import { updateSupabaseSession } from './lib/supabase/middleware';

const intl = createIntlMiddleware(routing);

const PROTECTED_RE = /^\/[^/]+\/(dashboard|admin)(\/|$)/;

// Prevent open-redirect phishing: the ?next= param must be a relative path
// matching an allowed page — blocks links like ?next=//evil.com or ?next=https://attacker.com
const SAFE_NEXT_RE = /^\/[a-z]{2}\/(dashboard|marketplace|booking|consultant|services|about|contact|blog)(\/|$)/;

function sanitizeNextParam(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || /^\/\//.test(next)) return null;
  return SAFE_NEXT_RE.test(next) ? next : null;
}

export async function middleware(req: NextRequest) {
  // Strip any unsafe ?next= values before processing (anti-phishing)
  const rawNext = req.nextUrl.searchParams.get('next');
  if (rawNext && !sanitizeNextParam(rawNext)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  const { response: supaResponse, user } = await updateSupabaseSession(req);

  if (PROTECTED_RE.test(req.nextUrl.pathname) && !user) {
    const localeMatch = req.nextUrl.pathname.match(/^\/([^/]+)/);
    const locale = localeMatch?.[1] ?? 'en';
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/auth`;
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const intlResponse = intl(req);

  // Forward refreshed Supabase cookies onto the intl response.
  if (supaResponse) {
    supaResponse.cookies.getAll().forEach(({ name, value }) => {
      intlResponse.cookies.set(name, value);
    });
  }

  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
