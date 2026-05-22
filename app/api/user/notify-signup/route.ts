import { NextResponse } from 'next/server';
import { sendOwnerSignupAlert } from '@/lib/email';
import { logUserSignup } from '@/lib/google-sheets';
import { rateLimitOr429 } from '@/lib/rate-limit';
import { isTrustedOrigin } from '@/lib/security';

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const limited = rateLimitOr429(req, 'notify-signup', 5, HOUR);
  if (limited) return limited;

  let email = '';
  try {
    const body = await req.json();
    email = typeof body?.email === 'string' ? body.email.slice(0, 254) : '';
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const date = new Date().toISOString();
  await Promise.allSettled([
    sendOwnerSignupAlert(email),
    logUserSignup(email, date),
  ]);

  return NextResponse.json({ ok: true });
}
