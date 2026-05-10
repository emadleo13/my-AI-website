import { Link } from '@/lib/i18n-routing';
import { tagToSlug } from '@/lib/blog-utils';
import { cn } from '@/lib/utils';

interface Props {
  tags: string[];
  size?: 'sm' | 'md';
  /** Render plain (non-link) chips, e.g. inside a card that already links elsewhere. */
  asLinks?: boolean;
  className?: string;
}

export function TagChips({
  tags,
  size = 'sm',
  asLinks = true,
  className,
}: Props) {
  if (tags.length === 0) return null;
  const sizeClasses =
    size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[11px] px-2 py-0.5';

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => {
        const slug = tagToSlug(tag);
        const inner = (
          <span
            className={cn(
              'inline-flex items-center rounded-full border border-border bg-muted/40 font-medium tracking-wide text-muted-foreground transition-colors',
              asLinks && 'hover:border-primary/40 hover:text-primary',
              sizeClasses,
            )}
          >
            #{tag}
          </span>
        );
        return (
          <li key={slug || tag}>
            {asLinks && slug ? (
              <Link href={`/blog/tags/${slug}`}>{inner}</Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
