import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { TagChips } from '@/components/blog/TagChips';
import {
  getPostsByTagSlug,
  listAllTagsAcrossLocales,
} from '@/lib/blog';
import { type Locale } from '@/lib/i18n';

export async function generateStaticParams() {
  const all = await listAllTagsAcrossLocales();
  return all.map(({ locale, tag }) => ({ locale, tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag } = await params;
  const decoded = decodeURIComponent(tag);
  const { label, posts } = await getPostsByTagSlug(locale as Locale, decoded);
  if (!label) return {};
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: t('taggedTitle', { tag: label }),
    description: t('taggedSubtitle', { tag: label, count: posts.length }),
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const decoded = decodeURIComponent(tag);
  const { posts, label } = await getPostsByTagSlug(locale as Locale, decoded);

  if (!label) notFound();

  const t = await getTranslations('blog');

  return (
    <div className="container py-16 md:py-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        {t('back')}
      </Link>

      <header className="max-w-2xl mt-4 mb-10 space-y-3">
        <p className="text-xs uppercase tracking-wider text-accent">
          {t('topic')}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t('taggedTitle', { tag: label })}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('taggedSubtitle', { tag: label, count: posts.length })}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group"
          >
            <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/${post.imageSeed}/800/500`}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('minRead', { n: post.readingMinutes })}
                  </span>
                </div>
                <h2 className="text-lg font-semibold leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                {post.tags.length > 0 && (
                  <TagChips tags={post.tags} asLinks={false} />
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {t('readMore')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
