import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { SERVICE_MAP } from '@/lib/marketplace-services';
import { rateLimitOr429 } from '@/lib/rate-limit';

const HOUR = 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = rateLimitOr429(req, 'service-pay', 10, HOUR);
  if (limited) return limited;

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: request } = await supabase
    .from('service_requests')
    .select('id, service_type, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!request) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (request.status === 'paid' || request.status === 'in_progress' || request.status === 'delivered') {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 });
  }

  // The price always comes from the server-side catalogue. The row's `amount`
  // column is informational only — it must never decide what is charged.
  const service = SERVICE_MAP[request.service_type as keyof typeof SERVICE_MAP];
  if (!service) return NextResponse.json({ error: 'invalid_service' }, { status: 400 });
  const amount = service.priceEurCents;

  if (!stripe) {
    return NextResponse.json({ demo: true, clientSecret: 'demo_secret' });
  }

  try {
    // Repeated clicks reuse one PaymentIntent instead of creating several.
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: 'eur',
        metadata: { serviceRequestId: id, serviceType: request.service_type, userId: user.id },
      },
      { idempotencyKey: `service-request-${id}-${amount}` },
    );

    // Users can't update their own rows (RLS) — record the intent server-side.
    const admin = getSupabaseAdmin();
    if (admin) {
      await admin
        .from('service_requests')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', id);
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[service-request/pay] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'payment_failed' }, { status: 500 });
  }
}
