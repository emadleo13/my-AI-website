import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from './ScrollReveal';
import { getAllPosts } from '@/lib/blog';
import { type Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
}

export async function BlogPreview({ locale }: Props) {
  const t = await getTranslations('blog');
  const posts = (await getAllPosts(locale)).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 0.06}>
            <Link href={`/blog/${post.slug}`} className="block h-full group">
              <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/${post.imageSeed}/800/500`}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
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
                  <h3 className="font-semibold text-lg leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t('readMore')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
