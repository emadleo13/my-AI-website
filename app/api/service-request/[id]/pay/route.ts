import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseServer } from '@/lib/supabase/server';
import { SERVICE_MAP } from '@/lib/marketplace-services';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: request } = await supabase
    .from('service_requests')
    .select('id, service_type, status, amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!request) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (request.status === 'paid' || request.status === 'in_progress' || request.status === 'delivered') {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 });
  }

  const service = SERVICE_MAP[request.service_type as keyof typeof SERVICE_MAP];
  const amount = request.amount ?? service?.priceEurCents ?? 1000;

  if (!stripe) {
    return NextResponse.json({ demo: true, clientSecret: 'demo_secret' });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { serviceRequestId: id, serviceType: request.service_type, userId: user.id },
  });

  await supabase
    .from('service_requests')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', id);

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
