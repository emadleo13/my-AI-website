import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPostLoading() {
  return (
    <article className="pb-20">
      <Skeleton className="h-[280px] md:h-[400px] w-full rounded-none" />
      <div className="container max-w-3xl -mt-20 relative z-10 space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="space-y-3 mt-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </article>
  );
}
