import { NextResponse } from 'next/server';
import {
  ANTHROPIC_MODEL,
  ASSISTANT_SYSTEM_PROMPT,
  getAnthropicClient,
} from '@/lib/anthropic';
import { chatRequestSchema } from '@/lib/validators';
import { maybeSweepStale, rateLimitOr429 } from '@/lib/rate-limit';
import { retrieveRelevantChunks } from '@/lib/rag/retrieve';
import { buildRagSystemPrompt } from '@/lib/rag/build-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  maybeSweepStale();
  const limited = rateLimitOr429(req, 'chat', 30, HOUR);
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const client = getAnthropicClient();

  // Demo mode — return a static reply when no API key is configured.
  if (!client) {
    const lastUser =
      [...parsed.data.messages].reverse().find((m) => m.role === 'user')?.content ??
      '';
    const demo = `(Demo response — set ANTHROPIC_API_KEY to enable real answers.)\n\nIn production I'd answer about: "${lastUser.slice(0, 200)}". Topics I cover: jobs in Romania, AI consulting, programming help, and AI agents.`;
    return new Response(demo, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const lastUserMessage =
    [...parsed.data.messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  const ragChunks = await retrieveRelevantChunks(lastUserMessage, 5).catch(() => []);

  const systemPrompt =
    ragChunks.length > 0
      ? buildRagSystemPrompt(ASSISTANT_SYSTEM_PROMPT, ragChunks)
      : ASSISTANT_SYSTEM_PROMPT;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const response = client.messages.stream({
          model: ANTHROPIC_MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: parsed.data.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Anthropic API error';
        controller.enqueue(new TextEncoder().encode(`\n\n[error] ${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
