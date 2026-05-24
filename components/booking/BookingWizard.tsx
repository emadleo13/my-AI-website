'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ServiceStep, type ServiceKey } from './ServiceStep';
import { DateTimeStep } from './DateTimeStep';
import { DetailsStep, type DetailsState } from './DetailsStep';
import { IntakeStep, type IntakeState, type IntakeErrors } from './IntakeStep';
import { ScopeStep, type ScopeState, type ScopeKey, type SocialPlatform } from './ScopeStep';
import { Confirmation } from './Confirmation';
import { type BookingTime } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4 | 5;

interface ConfirmedBooking {
  serviceType: ServiceKey;
  bookingDate: string;
  bookingTime: BookingTime;
  guestEmail: string;
  scope: ScopeKey;
  socialPlatform?: SocialPlatform;
}

const EMPTY_DETAILS: DetailsState = { name: '', email: '', phone: '', notes: '' };
const EMPTY_INTAKE: IntakeState = { company: '', role: '', teamSize: null, goal: '', aiExperience: null };
const EMPTY_SCOPE: ScopeState = { scope: null, socialPlatform: 'whatsapp', socialContact: '' };

export function BookingWizard() {
  const t = useTranslations('booking');
  const tErr = useTranslations('booking.errors');
  const tServices = useTranslations('booking.services');
  const locale = useLocale();

  const [step, setStep] = React.useState<Step>(1);
  const [service, setService] = React.useState<ServiceKey | null>(null);
  const [date, setDate] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<BookingTime | null>(null);
  const [details, setDetails] = React.useState<DetailsState>(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = React.useState<Partial<Record<keyof DetailsState, string>>>({});
  const [intake, setIntake] = React.useState<IntakeState>(EMPTY_INTAKE);
  const [intakeErrors, setIntakeErrors] = React.useState<IntakeErrors>({});
  const [scope, setScope] = React.useState<ScopeState>(EMPTY_SCOPE);
  const [scopeErrors, setScopeErrors] = React.useState<{ socialContact?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [finalizing, setFinalizing] = React.useState(false);
  const [confirmedBooking, setConfirmedBooking] = React.useState<ConfirmedBooking | null>(null);

  const stepLabels: string[] = [
    t('steps.service'),
    t('steps.datetime'),
    t('steps.details'),
    t('steps.intake'),
    t('steps.scope'),
  ];

  const validateDetails = () => {
    const e: typeof detailErrors = {};
    if (details.name.trim().length < 2) e.name = 'min 2';
    if (!/^\S+@\S+\.\S+$/.test(details.email)) e.email = 'invalid';
    setDetailErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateIntake = () => {
    const e: IntakeErrors = {};
    if (intake.company.trim().length < 2) e.company = 'required';
    if (!intake.role) e.role = 'required';
    if (intake.goal.trim().length < 10) e.goal = 'required';
    setIntakeErrors(e);
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

  // Builds the notes string combining intake data + scope info + client notes
  const buildNotes = () => {
    const lines: string[] = [];
    lines.push(`[Company: ${intake.company}]`);
    if (intake.role) lines.push(`[Role: ${intake.role}]`);
    if (intake.teamSize) lines.push(`[Team size: ${intake.teamSize}]`);
    if (intake.aiExperience) lines.push(`[AI experience: ${intake.aiExperience}]`);
    if (intake.goal) lines.push(`[Goal: ${intake.goal}]`);
    lines.push(`[Scope: ${scope.scope}]`);
    if (scope.scope === 'free' && scope.socialPlatform) {
      lines.push(`[Social: ${scope.socialPlatform} / ${scope.socialContact}]`);
    }
    if (details.notes) lines.push(`\nNotes: ${details.notes}`);
    return lines.join('\n');
  };

  // Submits the booking record. Called after payment (paid) or directly (free).
  const submitBooking = async (): Promise<boolean> => {
    if (!service || !date || !time || !scope.scope) return false;
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
          notes: buildNotes(),
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
        return false;
      }

      setDone(true);
      return true;
    } catch {
      toast.error(tErr('generic'));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleScopeConfirm = async () => {
    if (!validateScope() || !service || !date || !time || !scope.scope) return;

    // Free discovery call → direct booking, no payment
    if (scope.scope === 'free') {
      await submitBooking();
      return;
    }

    // Paid → redirect to Stripe Checkout (hosted page).
    // Hosted Checkout bypasses CSP/adblocker issues that plagued the embedded
    // PaymentElement: it runs entirely on checkout.stripe.com and only needs
    // a redirect from our site.
    setSubmitting(true);
    try {
      const res = await fetch('/api/stripe/booking-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: service,
          scope: scope.scope,
          bookingDate: date,
          bookingTime: time,
          guestName: details.name,
          guestEmail: details.email,
          phone: details.phone,
          notes: buildNotes(),
          locale,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.url) {
        toast.error(body?.message ?? tErr('generic'));
        return;
      }

      window.location.href = body.url as string;
    } catch {
      toast.error(tErr('generic'));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle return from Stripe Checkout via success_url (?session_id=…) or
  // cancel_url (?payment=cancelled). Runs once on mount.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const payment = params.get('payment');

    const clearQuery = () => {
      window.history.replaceState({}, '', window.location.pathname);
    };

    if (payment === 'cancelled') {
      toast.error(tErr('paymentCancelled'));
      clearQuery();
      return;
    }

    if (!sessionId) return;

    setFinalizing(true);
    fetch('/api/booking/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.booking) {
          setConfirmedBooking({
            serviceType: body.booking.serviceType as ServiceKey,
            bookingDate: body.booking.bookingDate as string,
            bookingTime: body.booking.bookingTime as BookingTime,
            guestEmail: body.booking.guestEmail as string,
            scope: body.booking.scope as ScopeKey,
          });
          setDone(true);
        } else {
          toast.error(body?.message ?? tErr('generic'));
        }
      })
      .catch(() => toast.error(tErr('generic')))
      .finally(() => {
        setFinalizing(false);
        clearQuery();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setStep(1);
    setService(null);
    setDate(null);
    setTime(null);
    setDetails(EMPTY_DETAILS);
    setDetailErrors({});
    setIntake(EMPTY_INTAKE);
    setIntakeErrors({});
    setScope(EMPTY_SCOPE);
    setScopeErrors({});
    setConfirmedBooking(null);
    setDone(false);
  };

  // Confirmation after a paid checkout that came back via success_url.
  // Wizard state is empty in this case (page reload from Stripe), so we use
  // confirmedBooking populated from the finalize API response.
  if (done && confirmedBooking) {
    return (
      <Confirmation
        serviceLabel={tServices(`${confirmedBooking.serviceType}.title`)}
        date={confirmedBooking.bookingDate}
        time={confirmedBooking.bookingTime}
        email={confirmedBooking.guestEmail}
        scope={confirmedBooking.scope}
        socialPlatform={confirmedBooking.socialPlatform}
        onAnother={reset}
      />
    );
  }

  // Confirmation after the free flow that completed in the same wizard session.
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

  // Finalizing a paid checkout — show a lightweight spinner while we verify the
  // Stripe session and create the booking.
  if (finalizing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('actions.submitting')}</p>
      </div>
    );
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1) as Step);
  const goForward = () => setStep((s) => Math.min(5, s + 1) as Step);

  const handleNext = () => {
    if (step === 3) {
      if (!validateDetails()) return;
    }
    if (step === 4) {
      if (!validateIntake()) return;
    }
    goForward();
  };

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <ol className="flex items-center justify-between gap-1">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const complete = step > n;
          return (
            <li key={label} className="flex-1 flex items-center gap-1.5">
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-xs font-bold flex-shrink-0',
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
                  'text-xs hidden sm:inline truncate',
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
          <IntakeStep value={intake} onChange={setIntake} errors={intakeErrors} />
        )}
        {step === 5 && (
          <ScopeStep value={scope} onChange={setScope} errors={scopeErrors} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={step === 1 || submitting}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('actions.back')}
        </Button>

        {step < 5 ? (
          <Button
            onClick={() => {
              if (step === 1 && !service) return;
              if (step === 2 && (!date || !time)) return;
              handleNext();
            }}
            disabled={
              (step === 1 && !service) ||
              (step === 2 && (!date || !time)) ||
              submitting
            }
            className="gap-1.5"
          >
            {t('actions.next')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        ) : (
          <Button
            onClick={handleScopeConfirm}
            disabled={submitting || !scope.scope}
            variant="accent"
            className="gap-1.5"
          >
            {submitting
              ? t('actions.submitting')
              : scope.scope && scope.scope !== 'free'
                ? t('actions.proceedToPayment')
                : t('actions.confirm')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
