import { NextResponse } from 'next/server';
import { bookingSchema } from '@/lib/validators';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { sendBookingEmails } from '@/lib/email';
import { maybeSweepStale, rateLimitOr429 } from '@/lib/rate-limit';

const SERVICE_LABELS: Record<string, string> = {
  ai: 'AI Strategy',
  agent: 'Agent Implementation',
  career: 'Career & Job Consulting',
  tech: 'General Tech Consulting',
};

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  maybeSweepStale();
  const limited = rateLimitOr429(req, 'booking', 10, HOUR);
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('bookings').insert({
    user_id: user?.id ?? null,
    guest_name: user ? null : parsed.data.guestName,
    guest_email: user ? null : parsed.data.guestEmail,
    service_type: parsed.data.serviceType,
    booking_date: parsed.data.bookingDate,
    booking_time: parsed.data.bookingTime,
    notes: parsed.data.notes || null,
    status: 'pending',
  });

  if (error) {
    // Unique violation when slot is already taken.
    if (error.code === '23505') {
      return NextResponse.json(
        { message: 'slot_taken' },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Best-effort email notification — don't block the response on it.
  void sendBookingEmails({
    serviceType: parsed.data.serviceType,
    serviceLabel:
      SERVICE_LABELS[parsed.data.serviceType] ?? parsed.data.serviceType,
    date: parsed.data.bookingDate,
    time: parsed.data.bookingTime,
    guestName: parsed.data.guestName,
    guestEmail: parsed.data.guestEmail,
    phone: parsed.data.phone || undefined,
    notes: parsed.data.notes || undefined,
    scope: parsed.data.scope,
    socialPlatform: parsed.data.socialPlatform,
    socialContact: parsed.data.socialContact || undefined,
  });

  return NextResponse.json({ ok: true });
}
