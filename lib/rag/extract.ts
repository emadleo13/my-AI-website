export type SourceType = 'pdf' | 'docx' | 'txt' | 'md' | 'web';

export async function extractText(
  buffer: Buffer,
  sourceType: SourceType,
): Promise<string> {
  switch (sourceType) {
    case 'pdf': {
      const pdfParse = (await import('pdf-parse')).default;
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
