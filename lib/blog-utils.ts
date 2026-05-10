export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[\p{M}]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
}
