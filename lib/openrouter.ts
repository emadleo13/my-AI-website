import { env, isOpenRouterConfigured } from './env';

export { isOpenRouterConfigured };

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Reliable free fallbacks tried (in order) when the primary model is
 * temporarily rate-limited upstream — common for free models under load.
 */
const FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
];

/** HTTP statuses worth retrying on the next model (vs. failing outright). */
const RETRYABLE = new Set([404, 408, 429, 500, 502, 503, 504, 524]);

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Primary model (env override) followed by de-duplicated fallbacks. */
function modelChain(): string[] {
  return [...new Set([env.openrouterModel, ...FALLBACK_MODELS])];
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
 * Stream a chat completion from OpenRouter (OpenAI-compatible), yielding text
 * deltas. Tries the primary free model first; on an upstream rate-limit or
 * transient error it falls through to the next model in the chain. Throws only
 * if every model fails (or the key/credit is rejected).
 */
export async function* streamOpenRouter(
  systemPrompt: string,
  messages: LlmMessage[],
): AsyncGenerator<string> {
  const models = modelChain();
  let lastErr = '';

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const res = await fetch(OPENROUTER_URL, {
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
    });

    if (!res.ok || !res.body) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      lastErr = `OpenRouter ${res.status} (${model}): ${detail}`;
      // Try the next free model on transient/availability errors.
      if (res.body == null || (RETRYABLE.has(res.status) && i < models.length - 1)) {
        continue;
      }
      throw new Error(lastErr);
    }

    yield* readSse(res.body);
    return;
  }

  throw new Error(lastErr || 'OpenRouter: all models failed');
}
