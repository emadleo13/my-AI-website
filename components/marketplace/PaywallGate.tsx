'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type MarketplaceService, formatPrice } from '@/lib/marketplace-services';

interface Props {
  requestId: string;
  service: MarketplaceService;
}

export function PaywallGate({ requestId, service }: Props) {
  const t = useTranslations('marketplace');
  const [loading, setLoading] = React.useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/service-request/${requestId}/pay`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      if (json.demo) {
        toast.success(t('paywall.demoSuccess'));
        return;
      }
      // In a real flow: redirect to Stripe hosted page or open Elements
      // For now, show the client secret info
      toast.success(t('paywall.paymentInitiated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-amber-500/10 p-3">
            <Lock className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{t('paywall.title')}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {t('paywall.desc')}
            </p>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(service.priceEurCents)}
          </div>
          <Button onClick={handlePay} disabled={loading} size="lg" className="gap-2 w-full max-w-xs">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('paywall.processing') : t('paywall.cta')}
          </Button>
          <p className="text-[11px] text-muted-foreground">{t('paywall.secureNote')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
