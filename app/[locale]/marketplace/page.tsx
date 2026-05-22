import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Zap } from 'lucide-react';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketplace' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('marketplace');

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            {t('hero.eyebrow')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
          {(['step1', 'step2', 'step3'] as const).map((step, i) => (
            <div key={step} className="space-y-1.5">
              <div className="mx-auto h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <p className="text-xs font-medium">{t(`hero.${step}`)}</p>
            </div>
          ))}
        </div>

        {/* Service grid */}
        <MarketplaceGrid />
      </div>
    </div>
  );
}
