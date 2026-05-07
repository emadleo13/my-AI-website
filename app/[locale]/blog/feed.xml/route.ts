import { getAllPosts } from '@/lib/blog';
import { locales, type Locale } from '@/lib/i18n';
import { env } from '@/lib/env';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const escapeXml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c] ?? c,
  );

const SITE_TITLE: Record<Locale, string> = {
  en: 'Emad — AI Consultant Blog',
  fa: 'بلاگ عماد — مشاور هوش مصنوعی',
  ro: 'Blog Emad — Consultant AI',
};

const SITE_DESCRIPTION: Record<Locale, string> = {
  en: 'Notes on AI, building, and the Romanian tech scene.',
  fa: 'یادداشت‌هایی دربارهٔ هوش مصنوعی، ساختن و فضای فناوری رومانی.',
  ro: 'Note despre AI, construcție și scena tech din România.',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: localeParam } = await params;
  const locale = (locales as readonly string[]).includes(localeParam)
    ? (localeParam as Locale)
    : 'en';

  const base = env.siteUrl.replace(/\/$/, '');
  const feedUrl = `${base}/${locale}/blog/feed.xml`;
  const blogUrl = `${base}/${locale}/blog`;
  const posts = await getAllPosts(locale);

  const lastBuildDate =
    posts[0] && posts[0].date
      ? new Date(posts[0].date).toUTCString()
      : new Date().toUTCString();

  const items = posts
    .map((p) => {
      const link = `${base}/${locale}/blog/${p.slug}`;
      const pubDate = p.date
        ? new Date(p.date).toUTCString()
        : new Date().toUTCString();
      const categories = p.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');
      return [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(p.excerpt)}</description>`,
        categories,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE[locale])}</title>
    <link>${escapeXml(blogUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION[locale])}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
