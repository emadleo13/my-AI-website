'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ServiceStep, type ServiceKey } from './ServiceStep';
import { DateTimeStep } from './DateTimeStep';
import { DetailsStep, type DetailsState } from './DetailsStep';
import { Confirmation } from './Confirmation';
import { type BookingTime } from '@/lib/utils';

type Step = 1 | 2 | 3;

const EMPTY_DETAILS: DetailsState = { name: '', email: '', phone: '', notes: '' };

export function BookingWizard() {
  const t = useTranslations('booking');
  const tErr = useTranslations('booking.errors');

  const [step, setStep] = React.useState<Step>(1);
  const [service, setService] = React.useState<ServiceKey | null>(null);
  const [date, setDate] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<BookingTime | null>(null);
  const [details, setDetails] = React.useState<DetailsState>(EMPTY_DETAILS);
  const [errors, setErrors] = React.useState<Partial<Record<keyof DetailsState, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const stepLabels = [t('steps.service'), t('steps.datetime'), t('steps.details')];
  const tServices = useTranslations('booking.services');

  const canNext =
    (step === 1 && !!service) ||
    (step === 2 && !!date && !!time) ||
    step === 3;

  const validateDetails = () => {
    const e: typeof errors = {};
    if (details.name.trim().length < 2) e.name = 'min 2';
    if (!/^\S+@\S+\.\S+$/.test(details.email)) e.email = 'invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validateDetails() || !service || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: service,
          bookingDate: date,
          bookingTime: time,
          guestName: details.name,
          guestEmail: details.email,
          phone: details.phone,
          notes: details.notes,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 || body?.message === 'slot_taken') {
          toast.error(tErr('slotTaken'));
        } else if (res.status === 429) {
          toast.error(tErr('rateLimited'));
        } else {
          toast.error(body?.message ?? tErr('generic'));
        }
        return;
      }
      setDone(true);
    } catch {
      toast.error(tErr('generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setService(null);
    setDate(null);
    setTime(null);
    setDetails(EMPTY_DETAILS);
    setErrors({});
    setDone(false);
  };

  if (done && service && date && time) {
    return (
      <Confirmation
        serviceLabel={tServices(`${service}.title`)}
        date={date}
        time={time}
        email={details.email}
        onAnother={reset}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ol className="flex items-center justify-between gap-2">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const complete = step > n;
          return (
            <li key={label} className="flex-1 flex items-center gap-2">
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-xs font-bold flex-shrink-0',
                  complete
                    ? 'bg-primary text-primary-foreground'
                    : active
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {n}
              </span>
              <span
                className={cn(
                  'text-sm hidden sm:inline',
                  active ? 'font-semibold' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <span className="flex-1 h-px bg-border" />
              )}
            </li>
          );
        })}
      </ol>

      <div>
        {step === 1 && <ServiceStep value={service} onChange={setService} />}
        {step === 2 && (
          <DateTimeStep
            date={date}
            time={time}
            onDate={(d) => {
              setDate(d);
              setTime(null);
            }}
            onTime={setTime}
          />
        )}
        {step === 3 && (
          <DetailsStep value={details} onChange={setDetails} errors={errors} />
        )}
      </div>

      <div className="flex justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
          disabled={step === 1 || submitting}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('actions.back')}
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
            disabled={!canNext}
            className="gap-1.5"
          >
            {t('actions.next')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting} variant="accent">
            {submitting ? t('actions.submitting') : t('actions.confirm')}
          </Button>
        )}
      </div>
    </div>
  );
}
