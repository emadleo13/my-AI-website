'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TagChips } from './TagChips';
import { tagToSlug } from '@/lib/blog-utils';
import { cn } from '@/lib/utils';

export interface BlogIndexPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  imageSeed: string;
  tags: string[];
}

interface Topic {
  slug: string;
  label: string;
  count: number;
}

interface Props {
  posts: BlogIndexPost[];
  topics: Topic[];
}

const FUSE_OPTIONS: IFuseOptions<BlogIndexPost> = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'excerpt', weight: 1 },
    { name: 'tags', weight: 1.5 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function BlogSearch({ posts, topics }: Props) {
  const t = useTranslations('blog');

  const [rawQuery, setRawQuery] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  // Debounce the query so we don't re-filter on every keystroke.
  React.useEffect(() => {
    const id = setTimeout(() => setQuery(rawQuery.trim()), 180);
    return () => clearTimeout(id);
  }, [rawQuery]);

  const fuse = React.useMemo(() => new Fuse(posts, FUSE_OPTIONS), [posts]);

  const filtered = React.useMemo(() => {
    let next = posts;

    if (activeTag) {
      next = next.filter((p) => p.tags.some((tag) => tagToSlug(tag) === activeTag));
    }

    if (query.length >= 2) {
      const matches = new Set(
        fuse.search(query).map((r) => r.item.slug),
      );
      next = next.filter((p) => matches.has(p.slug));
    }

    return next;
  }, [posts, activeTag, query, fuse]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="ps-9 pe-9"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => setRawQuery('')}
              aria-label={t('searchClear')}
              className="absolute end-2 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('resultCount', { count: filtered.length })}
        </p>
      </div>

      {topics.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground me-1">
            {t('topics')}
          </span>
          <TopicButton
            label={t('allTopics')}
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {topics.map(({ slug, label, count }) => (
            <TopicButton
              key={slug}
              label={`#${label}`}
              count={count}
              active={activeTag === slug}
              onClick={() => setActiveTag((prev) => (prev === slug ? null : slug))}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center text-sm text-muted-foreground">
            {t('searchEmpty')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
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
      )}
    </div>
  );
}

function TopicButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide transition-colors',
        active
          ? 'border-primary/60 bg-primary/15 text-primary'
          : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
      aria-pressed={active}
    >
      {label}
      {typeof count === 'number' && (
        <span
          className={cn(
            'rounded-full px-1 text-[10px]',
            active ? 'bg-primary/20' : 'bg-background/60',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
