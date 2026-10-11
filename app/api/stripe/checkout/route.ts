import { NextResponse } from 'next/server';
import { getStripeClient, PACKAGE_PRICES } from '@/lib/stripe';
import { isStripeConfigured, env } from '@/lib/env';
import { rateLimitOr429 } from '@/lib/rate-limit';
import { locales } from '@/lib/i18n';

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  const limited = rateLimitOr429(req, 'package-checkout', 10, HOUR);
  if (limited) return limited;

  if (!isStripeConfigured) {
    return NextResponse.json({ demo: true, url: '/services' }, { status: 200 });
  }

  let json: unknown;
  try { json = await req.json(); } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { plan, locale } = (json ?? {}) as { plan?: unknown; locale?: unknown };
  // Own-property check so values like "__proto__" can't resolve to Object.prototype.
  const pkg =
    typeof plan === 'string' && Object.hasOwn(PACKAGE_PRICES, plan) ? PACKAGE_PRICES[plan] : null;
  if (!pkg) {
    return NextResponse.json({ message: 'Invalid plan' }, { status: 400 });
  }
  if (typeof locale !== 'string' || !(locales as readonly string[]).includes(locale)) {
    return NextResponse.json({ message: 'Invalid locale' }, { status: 400 });
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
    console.error('[stripe/checkout] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ message: 'Payment could not be started.' }, { status: 500 });
  }
}
