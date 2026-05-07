import { describe, it, expect } from 'vitest';
import {
  tagToSlug,
  listSlugs,
  listTagsForLocale,
  getPostMeta,
  getAllPosts,
} from '@/lib/blog';
import { stripLocalePrefix } from '@/lib/i18n';

describe('tagToSlug', () => {
  it('lowercases and joins words with dashes', () => {
    expect(tagToSlug('AI Engineering')).toBe('ai-engineering');
  });

  it('strips diacritics for ASCII letters', () => {
    expect(tagToSlug('Carieră')).toBe('cariera');
    expect(tagToSlug('România')).toBe('romania');
  });

  it('preserves Persian script', () => {
    expect(tagToSlug('هوش مصنوعی')).toBe('هوش-مصنوعی');
  });

  it('collapses repeated separators and trims', () => {
    expect(tagToSlug('  ---AI / ML---  ')).toBe('ai-ml');
  });

  it('returns empty string for separator-only input', () => {
    expect(tagToSlug('---')).toBe('');
  });
});

describe('blog content reader', () => {
  it('lists the seed posts in English', async () => {
    const slugs = await listSlugs('en');
    expect(slugs.sort()).toEqual([
      'agent-frameworks',
      'bucharest-tech-job',
      'reliable-ai-products',
    ]);
  });

  it('parses frontmatter into typed metadata', async () => {
    const post = await getPostMeta('en', 'agent-frameworks');
    expect(post).not.toBeNull();
    expect(post?.title).toContain('agent framework');
    expect(post?.tags).toContain('AI');
    expect(post?.readingMinutes).toBeGreaterThan(0);
  });

  it('returns null for an unknown slug', async () => {
    const post = await getPostMeta('en', 'does-not-exist');
    expect(post).toBeNull();
  });

  it('orders posts by date descending', async () => {
    const posts = await getAllPosts('en');
    const dates = posts.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('aggregates and counts tags per locale', async () => {
    const tags = await listTagsForLocale('en');
    const ai = tags.find((t) => t.label === 'AI');
    expect(ai?.count).toBeGreaterThanOrEqual(2);
    // Sorted by count desc.
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1].count).toBeGreaterThanOrEqual(tags[i].count);
    }
  });
});

describe('stripLocalePrefix', () => {
  it('removes a known locale prefix', () => {
    expect(stripLocalePrefix('/en/dashboard')).toBe('/dashboard');
    expect(stripLocalePrefix('/fa/blog/foo')).toBe('/blog/foo');
    expect(stripLocalePrefix('/ro')).toBe('/');
  });

  it('leaves non-locale paths alone', () => {
    expect(stripLocalePrefix('/dashboard')).toBe('/dashboard');
    expect(stripLocalePrefix('/admin/bookings')).toBe('/admin/bookings');
  });

  it('returns null for falsy or unsafe input', () => {
    expect(stripLocalePrefix(null)).toBeNull();
    expect(stripLocalePrefix(undefined)).toBeNull();
    expect(stripLocalePrefix('')).toBeNull();
    expect(stripLocalePrefix('//evil.example.com')).toBeNull();
    expect(stripLocalePrefix('https://evil.example.com')).toBeNull();
  });
});
