import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { rateLimitOr429 } from '@/lib/rate-limit';
// Use Haiku for free demos — 12x cheaper than Sonnet (~€0.0001 per demo)
const DEMO_MODEL = 'claude-haiku-4-5-20251001';

const HOUR = 60 * 60 * 1000;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function buildPrompt(serviceType: string, metadata: Record<string, unknown>): string {
  const m = metadata;
  switch (serviceType) {
    case 'telegram_bot':
      return `You are a Telegram chatbot configurator. Create a complete chatbot configuration for this business:
Business name: ${m.businessName ?? 'Unknown'}
Topics: ${m.topics ?? 'General'}
Tone: ${m.tone ?? 'Professional'}
FAQ entries: ${JSON.stringify(m.faq ?? [])}

Return a JSON object with these fields:
{
  "welcomeMessage": "string - engaging welcome message",
  "menuItems": ["array of 3-5 menu options"],
  "faqResponses": [{"question": "string", "answer": "string"}],
  "personality": "string - one sentence describing the bot's personality",
  "setupInstructions": "step-by-step setup guide"
}
Return ONLY valid JSON, no markdown.`;

    case 'travel_automation':
      return `You are a travel assistant. Find the best travel options for:
From: ${m.origin ?? 'Unknown'}
To: ${m.destination ?? 'Unknown'}
Dates: ${m.dates ?? 'Flexible'}
Budget: ${m.budget ?? 'Moderate'}
Preferences: ${m.preferences ?? 'None'}

Return a JSON object:
{
  "options": [
    {
      "type": "flight|hotel|package",
      "title": "string",
      "description": "string",
      "estimatedPrice": "string",
      "searchUrl": "https://www.skyscanner.com/... or https://www.booking.com/...",
      "tips": "string"
    }
  ],
  "bestTime": "string",
  "travelTips": ["tip1", "tip2", "tip3"]
}
Include real Skyscanner and Booking.com search URLs with the actual city names encoded. Return ONLY valid JSON.`;

    case 'voice_assistant':
      return `You are a voice assistant configurator. Create a voice assistant setup for:
Website URL: ${m.websiteUrl ?? 'Not provided'}
Business name: ${m.businessName ?? 'Unknown'}
Key topics: ${m.topics ?? 'General'}
Language: ${m.language ?? 'English'}

Return a JSON object:
{
  "embedCode": "HTML embed snippet (single line, show a placeholder button)",
  "greetingScript": "string - what the assistant says first",
  "topicScripts": [{"topic": "string", "response": "string"}],
  "deploymentGuide": "step by step how to add this to any website"
}
Return ONLY valid JSON.`;

    default:
      return '';
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const limited = rateLimitOr429(req, 'service-demo', 5, HOUR);
  if (limited) return limited;

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: request } = await supabase
    .from('service_requests')
    .select('id, service_type, status, is_automated, metadata, result, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!request) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!request.is_automated) return NextResponse.json({ error: 'not_automated' }, { status: 400 });
  if (request.status !== 'pending') {
    return NextResponse.json({ result: request.result, alreadyDone: true });
  }

  if (!anthropic) {
    // Demo fallback
    const demoResult = { demo: true, message: 'Configure ANTHROPIC_API_KEY for real AI output.' };
    return NextResponse.json({ result: demoResult, preview: true });
  }

  const prompt = buildPrompt(request.service_type, (request.metadata as Record<string, unknown>) ?? {});
  let result: unknown;
  try {
    const message = await anthropic.messages.create({
      model: DEMO_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    result = JSON.parse(text);
  } catch (err) {
    console.error('[demo] Claude generation failed', err);
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 });
  }

  const admin = getSupabaseAdmin();
  await (admin ?? supabase)
    .from('service_requests')
    .update({ status: 'demo_used', result })
    .eq('id', id);

  return NextResponse.json({ result, preview: true });
}
