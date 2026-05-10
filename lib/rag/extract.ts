export type SourceType = 'pdf' | 'docx' | 'txt' | 'md' | 'web';

export async function extractText(
  buffer: Buffer,
  sourceType: SourceType,
): Promise<string> {
  switch (sourceType) {
    case 'pdf': {
      // pdf-parse is CJS; cast to any to avoid ESM/CJS interop type mismatch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = (await import('pdf-parse')) as any;
      const pdfParse: (buf: Buffer) => Promise<{ text: string }> =
        mod.default ?? mod;
      const result = await pdfParse(buffer);
      return result.text;
    }
    case 'docx': {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case 'txt':
    case 'md':
    case 'web':
      return new TextDecoder('utf-8').decode(buffer);
  }
}
