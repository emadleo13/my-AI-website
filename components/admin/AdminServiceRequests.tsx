'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/marketplace-services';

export interface AdminServiceRequestRow {
  id: string;
  user_id: string;
  service_type: string;
  status: string;
  is_automated: boolean;
  amount: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_email?: string;
}

const STATUSES = ['pending', 'demo_used', 'paid', 'in_progress', 'delivered'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600 dark:text-yellow-400',
  demo_used: 'text-blue-600 dark:text-blue-400',
  paid: 'text-purple-600 dark:text-purple-400',
  in_progress: 'text-orange-600 dark:text-orange-400',
  delivered: 'text-green-600 dark:text-green-400',
};

function ServiceStatusSelect({ requestId, current }: { requestId: string; current: string }) {
  const [value, setValue] = React.useState(current);
  const [saving, setSaving] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setSaving(true);
    try {
      const res = await fetch(`/api/service-request/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Failed');
      setValue(next);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={value}
      disabled={saving}
      onChange={handleChange}
      className={`h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${STATUS_COLORS[value] ?? ''}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}

interface Props {
  rows: AdminServiceRequestRow[];
}

export function AdminServiceRequests({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
          No service requests yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-accent/5">
              <td className="px-4 py-3 align-top text-xs text-muted-foreground whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 align-top font-medium">
                {r.service_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="text-xs text-muted-foreground">{r.user_email ?? r.user_id.slice(0, 8) + '…'}</div>
                {r.metadata && (
                  <details className="mt-1">
                    <summary className="text-[10px] cursor-pointer text-muted-foreground/70 hover:text-muted-foreground">
                      view data
                    </summary>
                    <pre className="text-[10px] mt-1 bg-muted p-1 rounded max-w-xs overflow-auto">
                      {JSON.stringify(r.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <span className="text-xs rounded-full border px-2 py-0.5">
                  {r.is_automated ? 'Auto' : 'Custom'}
                </span>
              </td>
              <td className="px-4 py-3 align-top text-xs">
                {r.amount ? formatPrice(r.amount) : '—'}
              </td>
              <td className="px-4 py-3 align-top">
                <ServiceStatusSelect requestId={r.id} current={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
