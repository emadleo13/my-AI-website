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
import { ScopeStep, type ScopeState } from './ScopeStep';
import { Confirmation } from './Confirmation';
import { type BookingTime } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4;

const EMPTY_DETAILS: DetailsState = { name: '', email: '', phone: '', notes: '' };
const EMPTY_SCOPE: ScopeState = { scope: null, socialPlatform: 'whatsapp', socialContact: '' };

export function BookingWizard() {
  const t = useTranslations('booking');
  const tErr = useTranslations('booking.errors');
  const tServices = useTranslations('booking.services');

  const [step, setStep] = React.useState<Step>(1);
  const [service, setService] = React.useState<ServiceKey | null>(null);
  const [date, setDate] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<BookingTime | null>(null);
  const [details, setDetails] = React.useState<DetailsState>(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = React.useState<Partial<Record<keyof DetailsState, string>>>({});
  const [scope, setScope] = React.useState<ScopeState>(EMPTY_SCOPE);
  const [scopeErrors, setScopeErrors] = React.useState<{ socialContact?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const stepLabels = [
    t('steps.service'),
    t('steps.datetime'),
    t('steps.details'),
    t('steps.scope'),
  ];

  const canNext =
    (step === 1 && !!service) ||
    (step === 2 && !!date && !!time) ||
    step === 3 ||
    (step === 4 && !!scope.scope);

  const validateDetails = () => {
    const e: typeof detailErrors = {};
    if (details.name.trim().length < 2) e.name = 'min 2';
    if (!/^\S+@\S+\.\S+$/.test(details.email)) e.email = 'invalid';
    setDetailErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateScope = () => {
    const e: typeof scopeErrors = {};
    if (scope.scope === 'free' && !scope.socialContact.trim()) {
      e.socialContact = 'required';
    }
    setScopeErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDetailsNext = () => {
    if (!validateDetails()) return;
    setStep(4);
  };

  const handleScopeConfirm = async () => {
    if (!validateScope() || !service || !date || !time || !scope.scope) return;
    setSubmitting(true);

    // Build notes: prepend scope info, append client notes
    const scopeLines = [
      `[Scope: ${scope.scope}]`,
      scope.scope === 'free' && scope.socialPlatform
        ? `[Social: ${scope.socialPlatform} / ${scope.socialContact}]`
        : null,
      details.notes ? `\n${details.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

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
          notes: scopeLines,
          scope: scope.scope,
          socialPlatform: scope.scope === 'free' ? scope.socialPlatform : undefined,
          socialContact: scope.scope === 'free' ? scope.socialContact : undefined,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok && !body?.demo) {
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
    setDetailErrors({});
    setScope(EMPTY_SCOPE);
    setScopeErrors({});
    setDone(false);
  };

  if (done && service && date && time && scope.scope) {
    return (
      <Confirmation
        serviceLabel={tServices(`${service}.title`)}
        date={date}
        time={time}
        email={details.email}
        scope={scope.scope}
        socialPlatform={scope.socialPlatform ?? undefined}
        onAnother={reset}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
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

      {/* Step content */}
      <div>
        {step === 1 && <ServiceStep value={service} onChange={setService} />}
        {step === 2 && (
          <DateTimeStep
            date={date}
            time={time}
            onDate={(d) => { setDate(d); setTime(null); }}
            onTime={setTime}
          />
        )}
        {step === 3 && (
          <DetailsStep value={details} onChange={setDetails} errors={detailErrors} />
        )}
        {step === 4 && (
          <ScopeStep value={scope} onChange={setScope} errors={scopeErrors} />
        )}
      </div>

      {/* Navigation */}
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

        {step < 3 && (
          <Button
            onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
            disabled={!canNext}
            className="gap-1.5"
          >
            {t('actions.next')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}

        {step === 3 && (
          <Button onClick={handleDetailsNext} disabled={submitting} className="gap-1.5">
            {t('actions.next')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}

        {step === 4 && (
          <Button
            onClick={handleScopeConfirm}
            disabled={submitting || !scope.scope}
            variant="accent"
            className="gap-1.5"
          >
            {submitting ? t('actions.submitting') : t('actions.confirm')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
