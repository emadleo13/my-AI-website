import { NextResponse } from 'next/server';
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

  // Persistence strategy: leads are always logged to Google Sheets (free, see
  // logLead below). Supabase is an OPTIONAL extra store — when it's configured
  // we also insert into the `contacts` table, but the form must keep working
  // when Supabase is paused/unavailable, so a Supabase failure never blocks the
  // submission. (Free-tier constraint: a dedicated Supabase project for this
  // site isn't available right now.)
  if (isSupabaseConfigured) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      // Fold the structured fields into the existing contacts table (name,
      // email, subject, message) so no schema migration is required.
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
        // Don't fail the request — the lead is still captured via Google Sheets
        // + email below. Just record the issue for debugging.
        console.warn('[contact] Supabase insert failed, falling back to Sheets:', error.message);
      }
    }
  }

  // Await the email + Google Sheets notifications so they reliably complete in
  // the serverless execution context (after() proved unreliable — the context
  // could be frozen before the Sheets write finished, so leads weren't logged).
  // A timeout cap guarantees the client is never left stuck on "Sending…": the
  // lead is already persisted above, so returning success after the cap is safe
  // even if a slow notification is still finishing.
  const notifications = Promise.allSettled([
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
  const cap = new Promise<void>((resolve) => setTimeout(resolve, 9000));
  await Promise.race([notifications, cap]);

  return NextResponse.json({ ok: true });
}
