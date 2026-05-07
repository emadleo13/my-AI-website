import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { StatusSelect } from './StatusSelect';

export interface AdminBookingRow {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  guest_name: string | null;
  guest_email: string | null;
  user_id: string | null;
  created_at: string;
}

export function AdminBookings({ rows }: { rows: AdminBookingRow[] }) {
  const t = useTranslations('admin.bookings');
  const tBooking = useTranslations('booking.services');

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t('headers.when')}</th>
            <th className="px-4 py-3">{t('headers.service')}</th>
            <th className="px-4 py-3">{t('headers.guest')}</th>
            <th className="px-4 py-3">{t('headers.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((b) => (
            <tr key={b.id} className="hover:bg-accent/5">
              <td className="px-4 py-3 align-top">
                <div className="font-medium">{b.booking_date}</div>
                <div className="text-xs text-muted-foreground">
                  {b.booking_time.slice(0, 5)}
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                {tBooking(`${b.service_type}.title`)}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="font-medium">
                  {b.guest_name ?? (b.user_id ? '—' : 'Guest')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {b.guest_email ?? ''}
                </div>
                {b.notes && (
                  <div className="mt-1 text-xs text-muted-foreground/80 max-w-sm line-clamp-2">
                    {b.notes}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <StatusSelect bookingId={b.id} current={b.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
