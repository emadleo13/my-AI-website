import { Skeleton } from '@/components/ui/skeleton';

export default function ContactLoading() {
  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-[68px] w-full" />
            <Skeleton className="h-[68px] w-full" />
          </div>
          <Skeleton className="h-[68px] w-full" />
          <Skeleton className="h-[180px] w-full" />
          <Skeleton className="h-11 w-32" />
        </div>
        <aside className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </aside>
      </div>
    </div>
  );
}
