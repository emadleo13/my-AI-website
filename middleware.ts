import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n-routing';
import { updateSupabaseSession } from './lib/supabase/middleware';

const intl = createIntlMiddleware(routing);

// Paths that require an authenticated session.
// Email-allowlist for /admin is enforced in the page itself (we'd need a DB
// hop here, which middleware can do but adds latency to every request).
const PROTECTED_RE = /^\/[^/]+\/(dashboard|admin)(\/|$)/;

export async function middleware(req: NextRequest) {
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
