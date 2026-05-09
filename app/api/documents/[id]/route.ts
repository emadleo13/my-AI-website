import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ message: 'Not configured' }, { status: 503 });

  const { id } = await params;
  if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });

  // Fetch file_path before deleting
  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single();

  // Delete document (cascades to document_chunks)
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  // Remove raw file from storage if present
  if (doc?.file_path) {
    await supabase.storage.from('documents').remove([doc.file_path]);
  }

  return NextResponse.json({ ok: true });
}
