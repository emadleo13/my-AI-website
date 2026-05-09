import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { documentWebContentSchema } from '@/lib/validators';
import { extractText, type SourceType } from '@/lib/rag/extract';
import { chunkText } from '@/lib/rag/chunk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const MIME_TO_SOURCE: Record<string, SourceType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/x-markdown': 'md',
};

const EXT_TO_SOURCE: Record<string, SourceType> = {
  pdf: 'pdf',
  docx: 'docx',
  txt: 'txt',
  md: 'md',
};

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ message: 'Not configured' }, { status: 503 });

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, source_type, char_count, chunk_count, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ message: 'Not configured' }, { status: 503 });

  const contentType = req.headers.get('content-type') ?? '';

  // Web text (JSON body)
  if (contentType.includes('application/json')) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = documentWebContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    }
    return processText(supabase, parsed.data.title, 'web', parsed.data.content, null);
  }

  // File upload (multipart/form-data)
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ message: 'Could not parse form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string | null)?.trim() ?? '';

  if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ message: 'File too large (max 10 MB)' }, { status: 413 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const sourceType: SourceType | undefined =
    MIME_TO_SOURCE[file.type] ?? EXT_TO_SOURCE[ext];

  if (!sourceType) {
    return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
  }

  const docTitle = title || file.name.replace(/\.[^.]+$/, '');
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text: string;
  try {
    text = await extractText(buffer, sourceType);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Extraction failed';
    return NextResponse.json({ message: msg }, { status: 500 });
  }

  // Store raw file in Supabase Storage
  const docId = crypto.randomUUID();
  const filePath = `${docId}/${file.name}`;
  const { error: storageErr } = await supabase.storage
    .from('documents')
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (storageErr) {
    return NextResponse.json({ message: storageErr.message }, { status: 500 });
  }

  return processText(supabase, docTitle, sourceType, text, filePath, docId);
}

async function processText(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  title: string,
  sourceType: SourceType,
  text: string,
  filePath: string | null,
  existingId?: string,
) {
  const chunks = chunkText(text);
  const charCount = text.length;

  const docId = existingId ?? crypto.randomUUID();

  const { error: insertErr } = await supabase.from('documents').insert({
    id: docId,
    title,
    source_type: sourceType,
    file_path: filePath,
    char_count: charCount,
    chunk_count: chunks.length,
  });

  if (insertErr) {
    if (filePath) await supabase.storage.from('documents').remove([filePath]);
    return NextResponse.json({ message: insertErr.message }, { status: 500 });
  }

  if (chunks.length > 0) {
    const rows = chunks.map((c) => ({
      document_id: docId,
      chunk_index: c.index,
      content: c.content,
    }));

    const { error: chunksErr } = await supabase.from('document_chunks').insert(rows);
    if (chunksErr) {
      await supabase.from('documents').delete().eq('id', docId);
      if (filePath) await supabase.storage.from('documents').remove([filePath]);
      return NextResponse.json({ message: chunksErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, documentId: docId, chunkCount: chunks.length });
}
