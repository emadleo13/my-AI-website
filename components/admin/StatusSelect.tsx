'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { updateBookingStatusAction } from '@/lib/actions';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;

interface Props {
  bookingId: string;
  current: (typeof STATUSES)[number];
}

export function StatusSelect({ bookingId, current }: Props) {
  const t = useTranslations('dashboard.status');
  const [state, action, pending] = useActionState(
    updateBookingStatusAction,
    null,
  );
  const lastShown = React.useRef<typeof state>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state === lastShown.current) return;
    lastShown.current = state;
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="inline-flex">
      <input type="hidden" name="id" value={bookingId} />
      <select
        name="status"
        defaultValue={current}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(s)}
          </option>
        ))}
      </select>
    </form>
  );
}
