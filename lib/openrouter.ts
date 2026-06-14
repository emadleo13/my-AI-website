import { env, isOpenRouterConfigured } from './env';

export { isOpenRouterConfigured };

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Stream a chat completion from OpenRouter (OpenAI-compatible) and yield text
 * deltas as they arrive. Designed for free models such as
 * `qwen/qwen3-next-80b-a3b-instruct:free` (set via OPENROUTER_MODEL).
 *
 * Throws if the request fails (e.g. 401 bad key, 429 rate/credit limit, or an
 * unknown model id) so the caller can surface the message in the stream.
 */
export async function* streamOpenRouter(
  systemPrompt: string,
  messages: LlmMessage[],
): AsyncGenerator<string> {
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
      model: env.openrouterModel,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Server-sent events: process complete lines, keep any trailing partial.
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

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
        // Partial JSON across chunk boundaries — ignore; it will complete next read.
      }
    }
  }
}
