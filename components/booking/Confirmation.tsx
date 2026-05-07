'use client';

import { useTranslations } from 'next-intl';
import { Check, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  serviceLabel: string;
  date: string;
  time: string;
  email: string;
  onAnother: () => void;
}

export function Confirmation({ serviceLabel, date, time, email, onAnother }: Props) {
  const t = useTranslations('booking');

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-8 pb-8 text-center space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold">{t('confirm.title')}</h2>
        <p className="text-muted-foreground">{t('confirm.desc')}</p>

        <div className="mx-auto max-w-sm rounded-lg border border-border bg-card p-4 text-sm space-y-2 text-start">
          <Row label={t('steps.service')} value={serviceLabel} />
          <Row label={t('steps.datetime')} value={`${date} · ${time}`} />
          <Row label={t('details.email')} value={email} />
        </div>

        <Button onClick={onAnother} variant="outline" className="gap-2">
          <CalendarCheck className="h-4 w-4" />
          {t('confirm.newBooking')}
        </Button>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-end">{value}</span>
    </div>
  );
}
