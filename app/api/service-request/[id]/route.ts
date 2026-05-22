import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const VALID_STATUSES = ['pending', 'demo_used', 'paid', 'in_progress', 'delivered'] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Admin-only endpoint
  const admin = await getAdminUser().catch(() => null);
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  let status: string;
  try {
    const body = await req.json();
    status = body?.status;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const { error } = await supabase
    .from('service_requests')
    .update({ status })
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
