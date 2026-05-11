import { NextResponse } from 'next/server';
import { getStripeClient, PACKAGE_PRICES } from '@/lib/stripe';
import { isStripeConfigured, env } from '@/lib/env';

export async function POST(req: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ demo: true, url: '/services' }, { status: 200 });
  }

  let json: unknown;
  try { json = await req.json(); } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { plan, locale } = json as { plan: string; locale: string };
  const pkg = PACKAGE_PRICES[plan];
  if (!pkg) {
    return NextResponse.json({ message: 'Invalid plan' }, { status: 400 });
  }

  const baseUrl = env.siteUrl;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: pkg.amount,
            product_data: { name: pkg.name },
          },
        },
      ],
      success_url: `${baseUrl}/${locale}/services?payment=success`,
      cancel_url:  `${baseUrl}/${locale}/services?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
