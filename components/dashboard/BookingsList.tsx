import { useTranslations } from 'next-intl';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CancelBookingButton } from './CancelBookingButton';

export interface BookingRow {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
}

interface Props {
  bookings: BookingRow[];
  variant: 'upcoming' | 'past';
}

const STATUS_VARIANT: Record<BookingRow['status'], 'default' | 'secondary' | 'accent' | 'outline'> = {
  pending: 'accent',
  confirmed: 'default',
  cancelled: 'outline',
  completed: 'secondary',
};

export function BookingsList({ bookings, variant }: Props) {
  const t = useTranslations('dashboard');
  const tBooking = useTranslations('booking.services');
  const tStatus = useTranslations('dashboard.status');

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
          {t(`${variant}.empty`)}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Card key={b.id} className="transition hover:border-primary/30">
          <CardContent className="pt-5 pb-5 grid gap-3 sm:grid-cols-[1fr_auto] items-center">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">
                  {tBooking(`${b.service_type}.title`)}
                </span>
                <Badge variant={STATUS_VARIANT[b.status]}>
                  {tStatus(b.status)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {b.booking_date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {b.booking_time.slice(0, 5)}
                </span>
              </div>
              {b.notes && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1">
                  {b.notes}
                </p>
              )}
            </div>
            {variant === 'upcoming' &&
              b.status !== 'cancelled' &&
              b.status !== 'completed' && (
                <CancelBookingButton bookingId={b.id} />
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
