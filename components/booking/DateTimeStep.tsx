'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  BOOKING_TIMES,
  type BookingTime,
  formatDateISO,
  formatDateLong,
  nextBusinessDays,
} from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  date: string | null;
  time: BookingTime | null;
  onDate: (d: string) => void;
  onTime: (t: BookingTime) => void;
}

export function DateTimeStep({ date, time, onDate, onTime }: Props) {
  const t = useTranslations('booking.datetime');
  const locale = useLocale();

  const days = React.useMemo(
    () => nextBusinessDays(new Date(), 12),
    [],
  );

  const [booked, setBooked] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/booking/availability?date=${date}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setBooked(Array.isArray(j.booked) ? j.booked : []);
      })
      .catch(() => {
        if (!cancelled) setBooked([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          {t('pickDate')}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => {
            const iso = formatDateISO(d);
            const active = iso === date;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onDate(iso)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center justify-center w-20 rounded-lg border px-2 py-3 text-sm transition-all',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/30',
                )}
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {formatDateLong(d, locale).split(/[\s,]+/)[0]}
                </span>
                <span className="text-lg font-bold">{d.getDate()}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDateLong(d, locale).split(/[\s,]+/)[2] ?? ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          {t('pickTime')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BOOKING_TIMES.map((slot) => {
            const isBooked = booked.includes(slot);
            const active = time === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => !isBooked && onTime(slot)}
                disabled={!date || isBooked || loading}
                className={cn(
                  'rounded-lg border px-3 py-3 text-sm font-medium transition-all',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isBooked
                      ? 'border-border bg-muted text-muted-foreground line-through cursor-not-allowed'
                      : 'border-border hover:border-primary/30 hover:bg-accent/5',
                  (!date || loading) && 'opacity-50',
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
        {date && booked.length === BOOKING_TIMES.length && (
          <p className="mt-3 text-sm text-muted-foreground">{t('noSlots')}</p>
        )}
      </div>
    </div>
  );
}
