'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type ServiceKey } from '@/lib/marketplace-services';

interface Props {
  requestId: string;
  serviceKey: ServiceKey;
  onComplete: (result: unknown) => void;
}

export function FreeDemoResult({ requestId, serviceKey, onComplete }: Props) {
  const t = useTranslations('marketplace');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Record<string, unknown> | null>(null);

  const runDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/service-request/${requestId}/demo`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setResult(json.result as Record<string, unknown>);
      onComplete(json.result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="space-y-4 text-center py-6">
        <p className="text-sm text-muted-foreground">{t('demo.readyMessage')}</p>
        <Button onClick={runDemo} disabled={loading} size="lg" className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? t('demo.generating') : t('demo.runDemo')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-green-600 dark:text-green-400">{t('demo.previewReady')}</span>
      </div>
      <DemoPreview serviceKey={serviceKey} result={result} t={t} />
    </div>
  );
}

function DemoPreview({
  serviceKey,
  result,
  t,
}: {
  serviceKey: ServiceKey;
  result: Record<string, unknown>;
  t: ReturnType<typeof useTranslations>;
}) {
  if (serviceKey === 'telegram_bot') {
    return (
      <div className="space-y-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs uppercase text-muted-foreground mb-1">{t('demo.welcomeMessage')}</p>
            <p className="text-sm">{String(result.welcomeMessage ?? '')}</p>
          </CardContent>
        </Card>
        {Array.isArray(result.faqResponses) && result.faqResponses[0] && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs uppercase text-muted-foreground mb-1">{t('demo.sampleFaq')}</p>
              <p className="text-sm font-medium">{String((result.faqResponses[0] as Record<string, unknown>).question)}</p>
              <p className="text-sm text-muted-foreground mt-1">{String((result.faqResponses[0] as Record<string, unknown>).answer)}</p>
            </CardContent>
          </Card>
        )}
        <p className="text-xs text-muted-foreground">{t('demo.unlockHint')}</p>
      </div>
    );
  }

  if (serviceKey === 'travel_automation') {
    const options = Array.isArray(result.options) ? result.options.slice(0, 3) : [];
    return (
      <div className="space-y-3">
        {(options as Record<string, unknown>[]).map((o, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{String(o.title)}</p>
                <span className="text-xs text-primary font-semibold shrink-0">{String(o.estimatedPrice)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{String(o.description)}</p>
              {Boolean(o.searchUrl) && (
                <a
                  href={String(o.searchUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  Search →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground">{t('demo.unlockHint')}</p>
      </div>
    );
  }

  if (serviceKey === 'voice_assistant') {
    return (
      <div className="space-y-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs uppercase text-muted-foreground mb-2">{t('demo.embedCode')}</p>
            <pre className="text-xs bg-background rounded p-2 overflow-x-auto border border-border">
              {String(result.embedCode ?? '')}
            </pre>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">{t('demo.unlockHint')}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 text-sm">{t('demo.requestReceived')}</CardContent>
    </Card>
  );
}
