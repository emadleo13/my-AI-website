import { NextResponse } from 'next/server';
import { getStripeClient, SERVICE_PRICES, SCOPE_PRICES } from '@/lib/stripe';
import { isStripeConfigured } from '@/lib/env';

export async function POST(req: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ demo: true, clientSecret: 'demo' }, { status: 200 });
  }

  let json: unknown;
  try { json = await req.json(); } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { serviceType, scope, guestName, guestEmail } = json as Record<string, string>;
  const amount = (scope ? SCOPE_PRICES[scope] : undefined) ?? SERVICE_PRICES[serviceType] ?? 49_00;

  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      receipt_email: guestEmail || undefined,
      metadata: { serviceType, scope: scope || '', guestName: guestName || '' },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, amount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
