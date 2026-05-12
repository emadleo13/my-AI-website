import { useTranslations } from 'next-intl';
import { Target, Eye, Heart } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const PILLARS = [
  { key: 'mission', icon: Target },
  { key: 'vision',  icon: Eye },
  { key: 'values',  icon: Heart },
] as const;

export function WhatDrivesUs() {
  const t = useTranslations('home.whatDrivesUs');

  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container">
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {t('eyebrow')}
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ key, icon: Icon }, i) => (
            <ScrollReveal key={key} delay={i * 0.08}>
              <div className="rounded-2xl border border-border bg-background p-8 h-full flex flex-col gap-4 hover:border-primary/40 hover:shadow-lg transition-all">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{t(`pillars.${key}.title`)}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                  {t(`pillars.${key}.desc`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
