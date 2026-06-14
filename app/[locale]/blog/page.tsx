import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Rss } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BlogSearch, type BlogIndexPost } from '@/components/blog/BlogSearch';
import { getAllPosts, listTagsForLocale } from '@/lib/blog';
import { type Locale } from '@/lib/i18n';
import { env } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const feedUrl = `${env.siteUrl.replace(/\/$/, '')}/${locale}/blog/feed.xml`;
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      types: { 'application/rss+xml': feedUrl },
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const [posts, topics] = await Promise.all([
    getAllPosts(locale as Locale),
    listTagsForLocale(locale as Locale),
  ]);

  // Server → client: ship just the metadata fields the search/filter UI needs.
  const indexPosts: BlogIndexPost[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readingMinutes: p.readingMinutes,
    imageSeed: p.imageSeed,
    tags: p.tags,
  }));

  return (
    <div className="container py-16 md:py-24">
      <header className="max-w-2xl mb-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">{t('title')}</span>
          </h1>
          <a
            href={`/${locale}/blog/feed.xml`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label={t('rss')}
            title={t('rss')}
          >
            <Rss className="h-3.5 w-3.5" />
            RSS
          </a>
        </div>
        <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
      </header>

      {indexPosts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
            {t('empty')}
          </CardContent>
        </Card>
      ) : (
        <BlogSearch posts={indexPosts} topics={topics} />
      )}
    </div>
  );
}
