import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function ConsultantLoading() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Card className="flex h-[640px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-28 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-3/4 ms-auto" />
            <Skeleton className="h-20 w-2/3" />
          </div>
          <div className="border-t border-border p-3">
            <Skeleton className="h-20 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
