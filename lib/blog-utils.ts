export function tagToSlug(tag: string): string {
  // Decompose so Latin diacritics become separate marks ("ă" → "a" + "̆"),
  // drop marks that follow a Latin letter, then recompose. Marks on other
  // scripts are kept, so Persian tags (e.g. "آینده") keep their spelling.
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .normalize('NFC')
    .replace(/[\p{M}]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
}
