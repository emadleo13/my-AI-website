import { NextResponse } from 'next/server';
import { getStripeClient, SCOPE_PRICES, SERVICE_PRICES } from '@/lib/stripe';
import { isStripeConfigured, env } from '@/lib/env';

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

interface CheckoutBody {
  serviceType?: string;
  scope?: string;
  bookingDate?: string;
  bookingTime?: string;
  guestName?: string;
  guestEmail?: string;
  phone?: string;
  notes?: string;
  locale?: string;
}

export async function POST(req: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ demo: true, url: '/booking?payment=demo' }, { status: 200 });
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const {
    serviceType,
    scope,
    bookingDate,
    bookingTime,
    guestName,
    guestEmail,
    phone,
    notes,
    locale,
  } = body;

  if (
    !serviceType ||
    !scope ||
    !bookingDate ||
    !bookingTime ||
    !guestName ||
    !guestEmail ||
    !locale
  ) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (scope === 'free') {
    return NextResponse.json({ message: 'Free scope does not need Stripe' }, { status: 400 });
  }

  const amount = SCOPE_PRICES[scope] ?? SERVICE_PRICES[serviceType] ?? 4900;
  const productName = SCOPE_NAMES[scope] ?? 'Consultation';
  const productDesc = `${SERVICE_LABELS[serviceType] ?? serviceType} · ${bookingDate} @ ${bookingTime}`;

  // Stripe metadata: each value max 500 chars. Notes can be long → split.
  const notesStr = String(notes ?? '');
  const notesChunks: Record<string, string> = {};
  const CHUNK = 450;
  for (let i = 0; i * CHUNK < notesStr.length && i < 30; i++) {
    notesChunks[`notes_${i}`] = notesStr.slice(i * CHUNK, (i + 1) * CHUNK);
  }

  const baseUrl = env.siteUrl;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
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
        serviceType: String(serviceType).slice(0, 100),
        scope: String(scope).slice(0, 100),
        bookingDate: String(bookingDate).slice(0, 20),
        bookingTime: String(bookingTime).slice(0, 10),
        guestName: String(guestName).slice(0, 200),
        guestEmail: String(guestEmail).slice(0, 200),
        phone: String(phone ?? '').slice(0, 50),
        ...notesChunks,
      },
      success_url: `${baseUrl}/${locale}/booking?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/booking?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
