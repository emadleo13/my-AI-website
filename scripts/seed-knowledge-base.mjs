import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Prefer': 'return=minimal',
};

function chunkText(text, chunkSize = 500, overlap = 100) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  const step = chunkSize - overlap;
  let i = 0;
  while (i < normalized.length) {
    const slice = normalized.slice(i, i + chunkSize);
    if (slice.length >= 50) chunks.push({ index: chunks.length, content: slice });
    i += step;
  }
  return chunks;
}

async function dbInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${table} insert failed (${res.status}): ${body}`);
  }
}

async function dbDelete(table, id) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
}

async function main() {
  const text = readFileSync('./knowledge-base.md', 'utf-8');
  const title = 'Emad AI Consultant — Main Knowledge Base';
  const chunks = chunkText(text);
  const docId = randomUUID();

  console.log(`Inserting document: "${title}"`);
  console.log(`  Characters: ${text.length}`);
  console.log(`  Chunks: ${chunks.length}`);

  await dbInsert('documents', {
    id: docId,
    title,
    source_type: 'md',
    file_path: null,
    char_count: text.length,
    chunk_count: chunks.length,
  });

  const chunkRows = chunks.map((c) => ({
    document_id: docId,
    chunk_index: c.index,
    content: c.content,
  }));

  try {
    await dbInsert('document_chunks', chunkRows);
  } catch (err) {
    await dbDelete('documents', docId);
    throw err;
  }

  console.log(`Done. Document ID: ${docId}`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
