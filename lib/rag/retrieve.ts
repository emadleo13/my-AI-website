import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface RetrievedChunk {
  content: string;
  rank: number;
}

export async function retrieveRelevantChunks(
  query: string,
  topK = 5,
): Promise<RetrievedChunk[]> {
  if (!query.trim()) return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('search_chunks', {
    query: query.trim(),
    top_k: topK,
  });

  if (error || !data) return [];

  return (data as RetrievedChunk[]).filter((c) => c.rank > 0);
}
