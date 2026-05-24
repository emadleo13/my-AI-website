'use client';

import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  onSuccess: () => void;
  amount: number;
}

function PaymentForm({ onSuccess, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('booking.payment');
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : '',
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? t('errorGeneric'));
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  const isLoading = !stripe;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{t('total')}</span>
          <span className="text-2xl font-extrabold">€{(amount / 100).toFixed(0)}</span>
        </div>
        <div className="min-h-[280px]">
          {!ready && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('loading')}
            </div>
          )}
          <PaymentElement
            onReady={() => setReady(true)}
            onLoadError={(event) => {
              setError(event.error?.message ?? t('errorGeneric'));
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading || processing}
        variant="accent"
        size="lg"
        className="w-full gap-2"
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />{t('loading')}</>
        ) : processing ? (
          <><Loader2 className="h-4 w-4 animate-spin" />{t('processing')}</>
        ) : (
          <><ShieldCheck className="h-4 w-4" />{t('pay')} €{(amount / 100).toFixed(0)}</>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        {t('secureNote')}
      </p>
    </form>
  );
}

interface PaymentStepProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  demo?: boolean;
}

export function PaymentStep({ clientSecret, amount, onSuccess, demo }: PaymentStepProps) {
  const t = useTranslations('booking.payment');

  if (demo) {
    return (
      <div className="space-y-4 text-center py-8">
        <p className="text-muted-foreground text-sm">{t('demoNote')}</p>
        <Button variant="accent" size="lg" onClick={onSuccess} className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          {t('simulatePay')}
        </Button>
      </div>
    );
  }

  if (!stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe', variables: { borderRadius: '8px' } },
      }}
    >
      <PaymentForm onSuccess={onSuccess} amount={amount} />
    </Elements>
  );
}
