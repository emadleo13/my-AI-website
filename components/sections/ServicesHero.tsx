import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

export function ServicesHero() {
  const t = useTranslations('services.hero');

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="container py-20 md:py-28 max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {t('eyebrow')}
        </span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="text-gradient">{t('title')}</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>
    </section>
  );
}
