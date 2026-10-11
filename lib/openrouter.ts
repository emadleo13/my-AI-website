import { env, isOpenRouterConfigured } from './env';

export { isOpenRouterConfigured };

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Give up on a model that hasn't produced its first token within this time
 * (queued free models can hang). Cleared as soon as text starts flowing, so
 * long answers are never cut off.
 */
const FIRST_TOKEN_TIMEOUT_MS = 20_000;

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Thrown when every model in the chain failed. Carries a log-only detail. */
export class OpenRouterError extends Error {}

/**
 * Model order: explicit override → free models → one cheap paid model.
 * De-duplicated, empty entries dropped.
 */
export function modelChain(): string[] {
  return [
    ...new Set(
      [env.openrouterModel, ...env.openrouterFreeModels, env.openrouterPaidModel].filter(Boolean),
    ),
  ];
}

/** Parse an OpenAI-style SSE body and yield text deltas. */
async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // keep trailing partial line for next read

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue; // skip ": keep-alive" comments
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta) yield delta;
      } catch {
        // Partial JSON across chunk boundaries — completes on a later read.
      }
    }
  }
}

/**
 * Stream a chat completion from OpenRouter, yielding text deltas.
 *
 * Walks the model chain: a model that errors (rate-limited, removed from the
 * catalogue, out of credit, timed out) or streams back nothing is skipped and
 * the next one is tried. Once a model has produced text we commit to it.
 * Throws OpenRouterError only if every model failed — the message is for
 * server logs and must never be shown to visitors.
 */
export async function* streamOpenRouter(
  systemPrompt: string,
  messages: LlmMessage[],
): AsyncGenerator<string> {
  const failures: string[] = [];

  for (const model of modelChain()) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FIRST_TOKEN_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.openrouterKey}`,
          'Content-Type': 'application/json',
          // Optional attribution headers OpenRouter uses for app rankings.
          'HTTP-Referer': env.siteUrl,
          'X-Title': 'emadai.dev',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          stream: true,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      failures.push(`${model}: ${err instanceof Error ? err.name : 'fetch failed'}`);
      continue;
    }

    if (!res.ok || !res.body) {
      clearTimeout(timer);
      const detail = (await res.text().catch(() => '')).slice(0, 200);
      failures.push(`${model}: HTTP ${res.status} ${detail}`);
      // A rejected key will fail for every model — stop early.
      if (res.status === 401) break;
      continue;
    }

    let produced = false;
    try {
      for await (const delta of readSse(res.body)) {
        if (!produced) clearTimeout(timer);
        produced = true;
        yield delta;
      }
    } catch (err) {
      clearTimeout(timer);
      // Mid-stream failure after text was sent: nothing sensible to retry.
      if (produced) throw new OpenRouterError(`${model}: stream aborted (${String(err)})`);
      failures.push(`${model}: stream error`);
      continue;
    }

    clearTimeout(timer);
    if (produced) return;
    failures.push(`${model}: empty response`);
  }

  throw new OpenRouterError(`all models failed — ${failures.join(' | ')}`);
}
