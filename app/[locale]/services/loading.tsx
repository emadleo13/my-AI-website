import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesLoading() {
  return (
    <>
      <section className="container py-20 md:py-28 max-w-3xl space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </section>
      <section className="container py-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </section>
      <section className="container py-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96 w-full rounded-xl" />
        ))}
      </section>
    </>
  );
}
