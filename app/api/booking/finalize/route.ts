import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isStripeConfigured } from '@/lib/env';
import { sendBookingEmails } from '@/lib/email';
import { logBooking } from '@/lib/google-sheets';

const SERVICE_LABELS: Record<string, string> = {
  ai: 'AI Strategy',
  agent: 'Agent Implementation',
  career: 'Career & Job Consulting',
  tech: 'General Tech Consulting',
};

export async function POST(req: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ message: 'Stripe not configured' }, { status: 503 });
  }

  let body: { sessionId?: string };
  try {
    body = (await req.json()) as { sessionId?: string };
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId } = body;
  if (!sessionId) {
    return NextResponse.json({ message: 'Missing sessionId' }, { status: 400 });
  }

  const stripe = getStripeClient();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ message: 'Invalid session' }, { status: 404 });
  }

  if (session.metadata?.flow !== 'booking') {
    return NextResponse.json({ message: 'Not a booking session' }, { status: 400 });
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json(
      { message: 'Payment not complete', paymentStatus: session.payment_status },
      { status: 402 },
    );
  }

  const meta = session.metadata ?? {};

  // Reconstruct notes from chunked metadata
  let notes = '';
  for (let i = 0; meta[`notes_${i}`] !== undefined; i++) {
    notes += meta[`notes_${i}`];
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase unavailable' }, { status: 503 });
  }

  const serviceType = meta.serviceType ?? '';
  const bookingDate = meta.bookingDate ?? '';
  const bookingTime = meta.bookingTime ?? '';
  const guestName = meta.guestName ?? '';
  const guestEmail = meta.guestEmail ?? '';
  const phone = meta.phone ?? '';
  const scope = meta.scope ?? '';

  // Idempotency: if a booking already exists for this slot we treat as success
  // (the user may have refreshed the success URL).
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', bookingDate)
    .eq('booking_time', bookingTime)
    .eq('guest_email', guestEmail)
    .in('status', ['pending', 'confirmed'])
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyCreated: true,
      booking: { serviceType, bookingDate, bookingTime, guestEmail, scope },
    });
  }

  const { error } = await supabase.from('bookings').insert({
    user_id: null,
    guest_name: guestName,
    guest_email: guestEmail,
    service_type: serviceType,
    booking_date: bookingDate,
    booking_time: bookingTime,
    notes: notes || null,
    status: 'confirmed',
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { ok: true, alreadyCreated: true, booking: { serviceType, bookingDate, bookingTime, guestEmail, scope } },
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Fire notifications (best effort, awaited because serverless terminates fast)
  await Promise.allSettled([
    logBooking({
      date: new Date().toISOString(),
      guestName,
      guestEmail,
      phone: phone || undefined,
      serviceType: SERVICE_LABELS[serviceType] ?? serviceType,
      bookingDate,
      bookingTime,
      scope: scope || undefined,
      notes: notes || undefined,
    }),
    sendBookingEmails({
      serviceType,
      serviceLabel: SERVICE_LABELS[serviceType] ?? serviceType,
      date: bookingDate,
      time: bookingTime,
      guestName,
      guestEmail,
      phone: phone || undefined,
      notes: notes || undefined,
      scope: scope || undefined,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    booking: { serviceType, bookingDate, bookingTime, guestEmail, scope },
  });
}
