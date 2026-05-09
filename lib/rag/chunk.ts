export interface TextChunk {
  index: number;
  content: string;
}

export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100,
): TextChunk[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length === 0) return [];

  const chunks: TextChunk[] = [];
  const step = chunkSize - overlap;
  let i = 0;

  while (i < normalized.length) {
    const slice = normalized.slice(i, i + chunkSize);
    if (slice.length >= 50) {
      chunks.push({ index: chunks.length, content: slice });
    }
    i += step;
  }

  return chunks;
}
