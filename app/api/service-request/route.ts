import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendServiceRequestAlert } from '@/lib/email';
import { logServiceRequest } from '@/lib/google-sheets';
import { rateLimitOr429 } from '@/lib/rate-limit';
import { isTrustedOrigin } from '@/lib/security';
import { SERVICE_MAP, type ServiceKey } from '@/lib/marketplace-services';

const HOUR = 60 * 60 * 1000;

const VALID_TYPES = Object.keys(SERVICE_MAP) as ServiceKey[];

export async function GET() {
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('service_requests')
    .select('id, service_type, status, is_automated, amount, result, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const limited = rateLimitOr429(req, 'service-request', 10, HOUR);
  if (limited) return limited;

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let serviceType: ServiceKey;
  let metadata: Record<string, unknown> = {};
  try {
    const body = await req.json();
    if (!VALID_TYPES.includes(body?.serviceType)) {
      return NextResponse.json({ error: 'invalid_service' }, { status: 400 });
    }
    serviceType = body.serviceType as ServiceKey;
    metadata = typeof body.metadata === 'object' && body.metadata !== null
      ? body.metadata
      : {};
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const service = SERVICE_MAP[serviceType];
  const admin = getSupabaseAdmin();

  // Prevent duplicate pending requests for same service
  const { data: existing } = await supabase
    .from('service_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('service_type', serviceType)
    .not('status', 'eq', 'delivered')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ request: existing, duplicate: true });
  }

  const { data: inserted, error } = await (admin ?? supabase)
    .from('service_requests')
    .insert({
      user_id: user.id,
      service_type: serviceType,
      status: 'pending',
      is_automated: service.isAutomated,
      amount: service.priceEurCents,
      metadata,
    })
    .select('id, service_type, status, is_automated, amount, created_at')
    .single();

  if (error || !inserted) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const date = new Date().toISOString();
  await Promise.allSettled([
    sendServiceRequestAlert(user.email ?? '', serviceType),
    logServiceRequest(user.email ?? '', serviceType, 'pending', date),
  ]);

  return NextResponse.json({ request: inserted }, { status: 201 });
}
