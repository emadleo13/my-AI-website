import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { rateLimitOr429 } from '@/lib/rate-limit';

const HOUR = 60 * 60 * 1000;

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const limited = rateLimitOr429(req, 'availability', 120, HOUR);
  if (limited) return limited;

  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { message: 'Provide ?date=YYYY-MM-DD' },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured) {
    // Demo: nothing booked.
    return NextResponse.json({ booked: [], demo: true });
  }

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ booked: [] });

  const { data, error } = await supabase
    .from('bookings')
    .select('booking_time, status')
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    console.error('[availability] query failed:', error.message);
    return NextResponse.json({ booked: [] });
  }

  const booked = (data ?? [])
    .map((r) => (r.booking_time as string).slice(0, 5))
    .filter(Boolean);

  return NextResponse.json({ booked });
}
