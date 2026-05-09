import type { RetrievedChunk } from './retrieve';

export function buildRagSystemPrompt(
  basePrompt: string,
  chunks: RetrievedChunk[],
): string {
  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.content}`)
    .join('\n\n');

  return `${basePrompt}

---
RELEVANT KNOWLEDGE BASE CONTEXT (retrieved for this query):
${context}
---
Use the context above when it is relevant to the question. If the context does not address the question, answer from your general knowledge.`;
}
