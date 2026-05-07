import { Skeleton } from '@/components/ui/skeleton';

export default function AboutLoading() {
  return (
    <>
      <section className="container py-20 md:py-28 grid gap-10 md:grid-cols-[260px_1fr] items-center">
        <Skeleton className="aspect-square w-[220px] md:w-[260px] rounded-3xl mx-auto md:mx-0" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </section>
      <section className="container py-12 max-w-3xl space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </section>
      <section className="container py-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </section>
    </>
  );
}
