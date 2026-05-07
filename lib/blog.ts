import fs from 'node:fs/promises';
import path from 'node:path';
import { type ReactElement } from 'react';
import matter from 'gray-matter';
import { type Locale } from './i18n';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostMeta {
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  imageSeed: string;
  tags: string[];
}

export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[\p{M}]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
}

export interface BlogPost extends BlogPostMeta {
  content: ReactElement;
}

function metaFromFrontmatter(
  locale: Locale,
  slug: string,
  data: Record<string, unknown>,
): BlogPostMeta {
  const rawTags = Array.isArray(data.tags) ? data.tags : [];
  const tags = rawTags
    .map((t) => String(t).trim())
    .filter(Boolean);

  return {
    slug,
    locale,
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ''),
    date: String(data.date ?? ''),
    readingMinutes: Number(data.readingMinutes ?? 5),
    imageSeed: String(data.imageSeed ?? slug),
    tags,
  };
}

// Supports both .mdx and .md so existing markdown posts keep working.
async function readRaw(locale: Locale, slug: string): Promise<string | null> {
  for (const ext of ['mdx', 'md'] as const) {
    const file = path.join(BLOG_DIR, locale, `${slug}.${ext}`);
    const raw = await fs.readFile(file, 'utf-8').catch(() => null);
    if (raw !== null) return raw;
  }
  return null;
}

export async function listSlugs(locale: Locale): Promise<string[]> {
  const dir = path.join(BLOG_DIR, locale);
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  // De-duplicate when both .md and .mdx exist for the same slug.
  const slugs = new Set(
    files
      .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
      .map((f) => f.replace(/\.(md|mdx)$/, '')),
  );
  return [...slugs];
}

export async function getPostMeta(
  locale: Locale,
  slug: string,
): Promise<BlogPostMeta | null> {
  const raw = await readRaw(locale, slug);
  if (raw === null) return null;
  const { data } = matter(raw);
  return metaFromFrontmatter(locale, slug, data);
}

export async function getAllPosts(locale: Locale): Promise<BlogPostMeta[]> {
  const slugs = await listSlugs(locale);
  const metas = await Promise.all(slugs.map((s) => getPostMeta(locale, s)));
  return metas
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(
  locale: Locale,
  slug: string,
): Promise<BlogPost | null> {
  const raw = await readRaw(locale, slug);
  if (raw === null) return null;

  // Lazy-load MDX deps so the cheap metadata path (and tests) don't pay the
  // RSC import cost. Static plugin chain — module cache makes repeats free.
  const [{ compileMDX }, { default: remarkGfm }, { default: rehypeHighlight }, { mdxComponents }] =
    await Promise.all([
      import('next-mdx-remote/rsc'),
      import('remark-gfm'),
      import('rehype-highlight'),
      import('@/components/mdx'),
    ]);

  const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
    source: raw,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypeHighlight, { detect: true }]],
      },
    },
  });

  return {
    ...metaFromFrontmatter(locale, slug, frontmatter),
    content,
  };
}

export async function listAllSlugsAcrossLocales(): Promise<
  { locale: Locale; slug: string }[]
> {
  const { locales } = await import('./i18n');
  const all = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await listSlugs(locale);
      return slugs.map((slug) => ({ locale, slug }));
    }),
  );
  return all.flat();
}

/** All distinct tag slugs that appear in posts for `locale`. */
export async function listTagsForLocale(
  locale: Locale,
): Promise<{ slug: string; label: string; count: number }[]> {
  const posts = await getAllPosts(locale);
  const map = new Map<string, { label: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = tagToSlug(tag);
      if (!slug) continue;
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { label: tag, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, { label, count }]) => ({ slug, label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function getPostsByTagSlug(
  locale: Locale,
  tagSlug: string,
): Promise<{ posts: BlogPostMeta[]; label: string | null }> {
  const posts = await getAllPosts(locale);
  let label: string | null = null;
  const matches = posts.filter((p) =>
    p.tags.some((t) => {
      const slug = tagToSlug(t);
      if (slug === tagSlug) {
        if (!label) label = t;
        return true;
      }
      return false;
    }),
  );
  return { posts: matches, label };
}

export async function listAllTagsAcrossLocales(): Promise<
  { locale: Locale; tag: string }[]
> {
  const { locales } = await import('./i18n');
  const all = await Promise.all(
    locales.map(async (locale) => {
      const tags = await listTagsForLocale(locale);
      return tags.map(({ slug }) => ({ locale, tag: slug }));
    }),
  );
  return all.flat();
}
