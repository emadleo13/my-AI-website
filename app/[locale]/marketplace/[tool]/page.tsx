'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n-routing';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToolRequestForm } from '@/components/marketplace/ToolRequestForm';
import { FreeDemoResult } from '@/components/marketplace/FreeDemoResult';
import { PaywallGate } from '@/components/marketplace/PaywallGate';
import { SERVICE_MAP, formatPrice, type ServiceKey } from '@/lib/marketplace-services';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type Step = 'form' | 'demo' | 'paywall' | 'paid' | 'notfound';

export default function ToolPage() {
  const params = useParams<{ locale: string; tool: string }>();
  const t = useTranslations('marketplace');
  const toolKey = params.tool as ServiceKey;
  const service = SERVICE_MAP[toolKey];

  const [user, setUser] = React.useState<{ email?: string } | null | undefined>(undefined);
  const [step, setStep] = React.useState<Step>('form');
  const [requestId, setRequestId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supa = getSupabaseBrowser();
    if (!supa) { setUser(null); return; }
    supa.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">{t('errors.notFound')}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/marketplace">{t('back')}</Link>
        </Button>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-1">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Link>
        </Button>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{t(`services.${toolKey}.title`)}</h1>
                {service.isAutomated ? (
                  <Badge variant="secondary">Automated</Badge>
                ) : (
                  <Badge variant="outline">Custom</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{t(`services.${toolKey}.desc`)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-primary">{formatPrice(service.priceEurCents)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-green-600 dark:text-green-400 text-xs">
              Free demo: {t(`services.${toolKey}.freeDemo`)}
            </span>
          </div>
        </div>

        {/* Not signed in */}
        {user === null && (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-muted-foreground">{t('auth.signInRequired')}</p>
              <Button asChild>
                <Link href="/auth">{t('auth.signIn')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading auth */}
        {user === undefined && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t('loading')}
            </CardContent>
          </Card>
        )}

        {/* Form step */}
        {user && step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('form.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolRequestForm
                serviceKey={toolKey}
                onSubmitted={(id) => {
                  setRequestId(id);
                  setStep(service.isAutomated ? 'demo' : 'paywall');
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Demo step (automated services) */}
        {user && step === 'demo' && requestId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('demo.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <FreeDemoResult
                requestId={requestId}
                serviceKey={toolKey}
                onComplete={() => setStep('paywall')}
              />
            </CardContent>
          </Card>
        )}

        {/* Paywall */}
        {user && step === 'paywall' && requestId && (
          <>
            <PaywallGate requestId={requestId} service={service} />
          </>
        )}

        {/* Paid / delivered */}
        {step === 'paid' && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
              <h3 className="font-semibold">{t('paid.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('paid.desc')}</p>
              <Button asChild variant="outline">
                <Link href="/dashboard">{t('paid.viewDashboard')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
