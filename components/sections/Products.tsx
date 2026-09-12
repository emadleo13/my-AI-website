'use client';

import { useTranslations } from 'next-intl';
import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';

/**
 * Home "What I build" section — the products, as opposed to the services.
 *
 * This section exists for a specific reason beyond marketing: outreach for
 * Paznic is sent from a mailbox on this domain. A stranger who receives an
 * unsolicited email about their site's security looks up the sender's domain
 * first, and if Paznic is nowhere on it the message reads as spam. This is the
 * proof that the two belong to the same person. Keep it above the fold-ish and
 * keep the outbound link working.
 */

const PAZNIC_URL = 'https://paznic.eu';
const FEATURES = ['passive', 'plain', 'alerts'] as const;

export function Products() {
  const t = useTranslations('home.products');

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('title')}</h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <ScrollReveal className="mt-12 max-w-4xl mx-auto" delay={0.08}>
        <Card className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/50">
          <BorderBeam size={220} duration={16} colorFrom="#ffaa40" colorTo="#9c40ff" />
          <CardContent className="pt-7 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    {t('paznic.name')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t('paznic.tagline')}</p>
                </div>
              </div>

              <p className="text-muted-foreground">{t('paznic.desc')}</p>

              <blockquote className="border-s-2 border-accent ps-4 text-sm italic text-muted-foreground">
                {t('paznic.why')}
              </blockquote>
            </div>

            <div className="space-y-5">
              <ul className="space-y-2.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <span className="text-sm font-medium">{t(`paznic.features.${f}`)}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="w-full">
                <a href={PAZNIC_URL} target="_blank" rel="noreferrer">
                  {t('paznic.cta')}
                  <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                </a>
              </Button>

              <p className="text-center text-xs text-muted-foreground">paznic.eu</p>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </section>
  );
}
