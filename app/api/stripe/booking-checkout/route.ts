import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripeClient, SCOPE_PRICES } from '@/lib/stripe';
import { isStripeConfigured, env } from '@/lib/env';
import { rateLimitOr429 } from '@/lib/rate-limit';
import { bookingSchema } from '@/lib/validators';
import { locales } from '@/lib/i18n';

const HOUR = 60 * 60 * 1000;

const SCOPE_NAMES: Record<string, string> = {
  session: 'Single Session (1-2 hours)',
  mini: 'Mini Project (1-2 weeks)',
  full: 'Full Project (ongoing engagement)',
};

const SERVICE_LABELS: Record<string, string> = {
  ai: 'AI Strategy',
  agent: 'Agent Implementation',
  career: 'Career & Job Consulting',
  tech: 'General Tech Consulting',
};

// Same field rules as a free booking, but a paid scope and a known locale are
// required (the locale ends up in the Stripe redirect URLs).
const checkoutSchema = bookingSchema
  .pick({
    serviceType: true,
    bookingDate: true,
    bookingTime: true,
    guestName: true,
    guestEmail: true,
    phone: true,
    notes: true,
  })
  .extend({
    scope: z.enum(['session', 'mini', 'full']),
    locale: z.enum(locales),
  });

export async function POST(req: Request) {
  const limited = rateLimitOr429(req, 'booking-checkout', 10, HOUR);
  if (limited) return limited;

  if (!isStripeConfigured) {
    return NextResponse.json({ demo: true, url: '/booking?payment=demo' }, { status: 200 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { serviceType, scope, bookingDate, bookingTime, guestName, guestEmail, phone, notes, locale } =
    parsed.data;

  // Price is decided server-side from the scope — never from the client.
  const amount = SCOPE_PRICES[scope];
  const productName = SCOPE_NAMES[scope];
  const productDesc = `${SERVICE_LABELS[serviceType]} · ${bookingDate} @ ${bookingTime}`;

  // Stripe metadata: each value max 500 chars. Notes can be long → split.
  const notesStr = notes ?? '';
  const notesChunks: Record<string, string> = {};
  const CHUNK = 450;
  for (let i = 0; i * CHUNK < notesStr.length && i < 30; i++) {
    notesChunks[`notes_${i}`] = notesStr.slice(i * CHUNK, (i + 1) * CHUNK);
  }

  // A double-click or retry with identical details returns the same Checkout
  // session instead of opening a second one that could also be paid.
  const idempotencyKey =
    'booking-checkout-' +
    createHash('sha256').update(JSON.stringify(parsed.data)).digest('hex').slice(0, 40);

  const baseUrl = env.siteUrl;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: amount,
              product_data: { name: productName, description: productDesc },
            },
          },
        ],
        customer_email: guestEmail,
        metadata: {
          flow: 'booking',
          serviceType,
          scope,
          bookingDate,
          bookingTime,
          guestName,
          guestEmail,
          phone: phone ?? '',
          ...notesChunks,
        },
        success_url: `${baseUrl}/${locale}/booking?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/${locale}/booking?payment=cancelled`,
      },
      { idempotencyKey },
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/booking-checkout] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ message: 'Payment could not be started.' }, { status: 500 });
  }
}
