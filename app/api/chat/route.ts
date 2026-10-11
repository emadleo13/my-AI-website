import { NextResponse } from 'next/server';
import {
  ANTHROPIC_MODEL,
  ASSISTANT_SYSTEM_PROMPT,
  getAnthropicClient,
} from '@/lib/anthropic';
import { isOpenRouterConfigured, streamOpenRouter } from '@/lib/openrouter';
import { chatRequestSchema } from '@/lib/validators';
import { trimHistory } from '@/lib/chat-history';
import { maybeSweepStale, rateLimitOr429 } from '@/lib/rate-limit';
import { retrieveRelevantChunks } from '@/lib/rag/retrieve';
import { buildRagSystemPrompt } from '@/lib/rag/build-prompt';
import { TELEGRAM_HANDLE } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HOUR = 60 * 60 * 1000;

/**
 * Shown when every provider failed. Provider errors carry model names, upstream
 * URLs and raw JSON — they go to the server log only, never to the visitor.
 */
const UNAVAILABLE: Record<string, string> = {
  en: `Sorry — I'm getting a lot of questions right now and can't answer this moment. Please try again in a minute, or message Emad directly on Telegram (${TELEGRAM_HANDLE}) or via the form on the Contact page.`,
  fa: `ببخشید — الان سؤال‌ها زیاد است و همین لحظه نمی‌توانم پاسخ بدهم. لطفاً یک دقیقهٔ دیگر دوباره امتحان کنید، یا مستقیم در تلگرام (${TELEGRAM_HANDLE}) یا از طریق فرم صفحهٔ تماس به عماد پیام بدهید.`,
  ro: `Îmi pare rău — primesc multe întrebări acum și nu pot răspunde în acest moment. Încearcă din nou peste un minut sau scrie-i lui Emad direct pe Telegram (${TELEGRAM_HANDLE}) ori prin formularul de pe pagina Contact.`,
};

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
    return NextResponse.json({ message: 'Invalid chat request' }, { status: 400 });
  }

  const locale = parsed.data.locale ?? 'en';
  const messages = trimHistory(parsed.data.messages);
  const lastUserMessage = messages[messages.length - 1]?.content ?? '';

  const anthropic = getAnthropicClient();

  // Demo mode — only when no provider is configured at all.
  if (!isOpenRouterConfigured && !anthropic) {
    const demo = `(Demo response — set OPENROUTER_API_KEY or ANTHROPIC_API_KEY to enable real answers.)\n\nIn production I'd answer about: "${lastUserMessage.slice(0, 200)}".`;
    return new Response(demo, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const ragChunks = await retrieveRelevantChunks(lastUserMessage, 5).catch(() => []);

  const systemPrompt =
    ragChunks.length > 0
      ? buildRagSystemPrompt(ASSISTANT_SYSTEM_PROMPT, ragChunks)
      : ASSISTANT_SYSTEM_PROMPT;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let sent = false;
      const emit = (text: string) => {
        sent = true;
        controller.enqueue(encoder.encode(text));
      };

      try {
        // 1) OpenRouter: free models first, then one cheap paid model.
        if (isOpenRouterConfigured) {
          try {
            for await (const delta of streamOpenRouter(systemPrompt, messages)) emit(delta);
          } catch (err) {
            console.error('[chat] OpenRouter failed:', err instanceof Error ? err.message : err);
            if (sent) throw err;
          }
        }

        // 2) Anthropic, only if OpenRouter is unset or produced nothing.
        if (!sent && anthropic) {
          const response = anthropic.messages.stream({
            model: ANTHROPIC_MODEL,
            max_tokens: 1024,
            system: systemPrompt,
            messages,
          });
          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              emit(event.delta.text);
            }
          }
        }

        if (!sent) emit(UNAVAILABLE[locale] ?? UNAVAILABLE.en);
      } catch (err) {
        console.error('[chat] provider error:', err instanceof Error ? err.message : err);
        emit(sent ? '\n\n…' : (UNAVAILABLE[locale] ?? UNAVAILABLE.en));
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
