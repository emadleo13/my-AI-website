import { NextResponse, after } from 'next/server';
import { contactSchema } from '@/lib/validators';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { sendDiscoveryEmails } from '@/lib/email';
import { logLead } from '@/lib/google-sheets';
import { maybeSweepStale, rateLimitOr429 } from '@/lib/rate-limit';

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  maybeSweepStale();
  const limited = rateLimitOr429(req, 'contact', 5, HOUR);
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, company, channel, service, message } = parsed.data;

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        message:
          'Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable persistence.',
        demo: true,
      },
      { status: 503 },
    );
  }

  const supabase = await getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase unavailable' }, { status: 503 });
  }

  // Fold the structured fields into the existing contacts table (name, email,
  // subject, message) so no schema migration is required.
  const composedMessage =
    `${company ? `Company: ${company}\n` : ''}` +
    `Channel: ${channel}\n\n` +
    message;

  const { error } = await supabase.from('contacts').insert({
    name,
    email,
    subject: service || 'discovery',
    message: composedMessage,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Run the email + Google Sheets notifications AFTER the response is sent.
  // `after()` keeps the serverless execution context alive for this work, so a
  // slow/hanging Resend or Sheets call can never leave the client stuck on
  // "Sending…". The lead is already persisted above.
  after(async () => {
    await Promise.allSettled([
      sendDiscoveryEmails({ name, email, company, channel, service, message }),
      logLead({
        date: new Date().toISOString(),
        name,
        email,
        company: company || undefined,
        channel,
        service: service || undefined,
        message,
      }),
    ]);
  });

  return NextResponse.json({ ok: true });
}
