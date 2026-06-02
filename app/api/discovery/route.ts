import { NextResponse } from 'next/server';
import { discoverySchema } from '@/lib/validators';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { sendDiscoveryRequestEmail } from '@/lib/email';
import { maybeSweepStale, rateLimitOr429 } from '@/lib/rate-limit';

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  maybeSweepStale();
  const limited = rateLimitOr429(req, 'discovery', 5, HOUR);
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = discoverySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        message:
          'Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable persistence.',
        demo: true,
      },
      { status: 503 },
    );
  }

  const supabase = await getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase unavailable' }, { status: 503 });
  }

  const { error } = await supabase.from('discovery_requests').insert({
    full_name: d.fullName,
    email: d.email,
    company: d.company || null,
    website: d.website || null,
    industry: d.industry || null,
    business_description: d.businessDescription || null,
    service_type: d.serviceType,
    project_goal: d.projectGoal,
    target_audience: d.targetAudience || null,
    platform: d.platform ?? [],
    current_tools: d.currentTools || null,
    integrations: d.integrations || null,
    has_content: d.hasContent || null,
    language: d.language || null,
    tone: d.tone || null,
    timeline: d.timeline || null,
    budget: d.budget || null,
    maintenance: d.maintenance || null,
    extra_notes: d.extraNotes || null,
    locale: d.locale || null,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Await the email so it reliably completes in the serverless context, capped
  // so the client is never stuck on "Submitting…" — the row is already saved.
  const notification = sendDiscoveryRequestEmail({
    fullName: d.fullName,
    email: d.email,
    company: d.company || undefined,
    website: d.website || undefined,
    industry: d.industry || undefined,
    businessDescription: d.businessDescription || undefined,
    serviceType: d.serviceType,
    projectGoal: d.projectGoal,
    targetAudience: d.targetAudience || undefined,
    platform: d.platform ?? [],
    currentTools: d.currentTools || undefined,
    integrations: d.integrations || undefined,
    hasContent: d.hasContent || undefined,
    language: d.language || undefined,
    tone: d.tone || undefined,
    timeline: d.timeline || undefined,
    budget: d.budget || undefined,
    maintenance: d.maintenance || undefined,
    extraNotes: d.extraNotes || undefined,
  });
  const cap = new Promise<void>((resolve) => setTimeout(resolve, 9000));
  await Promise.race([notification, cap]);

  return NextResponse.json({ ok: true });
}
