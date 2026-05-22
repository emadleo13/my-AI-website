import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, SERVICE_MAP } from '@/lib/marketplace-services';

export interface ServiceRequestRow {
  id: string;
  service_type: string;
  status: string;
  is_automated: boolean;
  amount: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  demo_used: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  paid: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  in_progress: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  delivered: 'bg-green-500/15 text-green-600 dark:text-green-400',
};

function StatusBadge({ status }: { status: string }) {
  const label = status.replace('_', ' ');
  const cls = STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

interface Props {
  requests: ServiceRequestRow[];
  emptyMessage: string;
}

export function ServiceRequestsList({ requests, emptyMessage }: Props) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => {
        const service = SERVICE_MAP[r.service_type as keyof typeof SERVICE_MAP];
        const Icon = service?.icon;
        const canContinue = r.status === 'pending' || r.status === 'demo_used';
        return (
          <Card key={r.id} className="hover:border-border/80 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 justify-between flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.service_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()} ·{' '}
                      {r.amount ? formatPrice(r.amount) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={r.status} />
                  {canContinue && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/marketplace/${r.service_type}`}>Continue</Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
