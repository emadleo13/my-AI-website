import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { env } from '@/lib/env';
import { listSlugs, listTagsForLocale } from '@/lib/blog';

const STATIC_ROUTES = [
  '',
  '/about',
  '/services',
  '/blog',
  '/contact',
  '/auth',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, '');
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: `${base}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${base}/${l}${route}`]),
        ),
      },
    })),
  );

  const blogEntries: MetadataRoute.Sitemap = (
    await Promise.all(
      locales.map(async (locale) => {
        const slugs = await listSlugs(locale);
        return slugs.map((slug) => ({
          url: `${base}/${locale}/blog/${slug}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${base}/${l}/blog/${slug}`]),
            ),
          },
        }));
      }),
    )
  ).flat();

  // Tag pages are locale-specific — same tag in en vs ro yields different
  // slugs (e.g. /en/blog/tags/career vs /ro/blog/tags/carier%C4%83), so we
  // don't emit cross-locale alternates here.
  const tagEntries: MetadataRoute.Sitemap = (
    await Promise.all(
      locales.map(async (locale) => {
        const tags = await listTagsForLocale(locale);
        return tags.map(({ slug }) => ({
          url: `${base}/${locale}/blog/tags/${encodeURIComponent(slug)}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.4,
        }));
      }),
    )
  ).flat();

  return [...staticEntries, ...blogEntries, ...tagEntries];
}
