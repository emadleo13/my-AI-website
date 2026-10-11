import type { LlmMessage } from './openrouter';

/** Most recent turns sent to the model — older context is dropped. */
export const HISTORY_MAX_MESSAGES = 16;
/** Character budget for the history sent to the model (~4k tokens). */
export const HISTORY_MAX_CHARS = 16000;

/**
 * Keep only the most recent messages that fit the budget, and make sure the
 * result starts with a user turn (the Anthropic API rejects a leading
 * assistant message, and a leading assistant turn is also the classic place
 * for a forged "here is my system prompt:" injection).
 *
 * The newest message is always kept, truncated if it alone exceeds the budget.
 */
export function trimHistory(
  messages: LlmMessage[],
  maxChars = HISTORY_MAX_CHARS,
  maxMessages = HISTORY_MAX_MESSAGES,
): LlmMessage[] {
  const kept: LlmMessage[] = [];
  let used = 0;

  for (let i = messages.length - 1; i >= 0 && kept.length < maxMessages; i--) {
    const m = messages[i];
    if (kept.length === 0) {
      const content = m.content.slice(0, maxChars);
      kept.unshift({ role: m.role, content });
      used += content.length;
      continue;
    }
    if (used + m.content.length > maxChars) break;
    kept.unshift({ role: m.role, content: m.content });
    used += m.content.length;
  }

  while (kept.length > 0 && kept[0].role !== 'user') kept.shift();
  return kept;
}
