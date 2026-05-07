import 'highlight.js/styles/github-dark.css';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import {
  getPostBySlug,
  listAllSlugsAcrossLocales,
} from '@/lib/blog';
import { TagChips } from '@/components/blog/TagChips';
import { type Locale } from '@/lib/i18n';

export async function generateStaticParams() {
  const all = await listAllSlugsAcrossLocales();
  return all.map(({ locale, slug }) => ({ locale, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale as Locale, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(locale as Locale, slug);
  if (!post) notFound();

  const t = await getTranslations('blog');

  return (
    <article className="pb-20">
      <div className="relative h-[280px] md:h-[400px] overflow-hidden border-b border-border/50">
        <Image
          src={`https://picsum.photos/seed/${post.imageSeed}/1600/900`}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container max-w-3xl -mt-20 relative z-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t('back')}
        </Link>

        <header className="mt-6 space-y-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{post.date}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t('minRead', { n: post.readingMinutes })}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            {post.excerpt}
          </p>
          {post.tags.length > 0 && <TagChips tags={post.tags} size="md" />}
        </header>

        <div className="prose prose-invert dark:prose-invert max-w-none mt-10 prose-headings:scroll-mt-20 prose-a:text-primary prose-strong:text-foreground prose-code:before:content-none prose-code:after:content-none">
          {post.content}
        </div>
      </div>
    </article>
  );
}
