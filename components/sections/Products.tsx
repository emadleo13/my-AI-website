'use client';

import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cog,
  Facebook,
  GraduationCap,
  Radar,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n-routing';
import { PRODUCT_URLS, SOCIAL } from '@/lib/site-config';
import { ScrollReveal } from './ScrollReveal';

/**
 * Home "What I build" section — the products, as opposed to the services.
 *
 * Paznic stays first and largest for a specific reason beyond marketing:
 * outreach for Paznic is sent from a mailbox on this domain. A stranger who
 * receives an unsolicited email about their site's security looks up the
 * sender's domain first, and if Paznic is nowhere on it the message reads as
 * spam. This is the proof that the two belong to the same person. Keep it
 * above the fold-ish and keep the outbound link working.
 *
 * UNIREAL and CNC Assist follow as a second row. Their copy is taken from the
 * live sites / Google Play listing — keep it in sync when those change.
 *
 * The Emad Agent Team closes the section as a wide card. Its repo is private,
 * so instead of an outbound link it invites visitors to book a call.
 */

const PAZNIC_FEATURES = ['passive', 'plain', 'alerts'] as const;

const AGENTS = [
  { key: 'sentinel', name: 'Sentinel', emoji: '🛡️' },
  { key: 'diagnostician', name: 'Diagnostician', emoji: '🔍' },
  { key: 'medic', name: 'Medic', emoji: '💊' },
  { key: 'herald', name: 'Herald', emoji: '📨' },
  { key: 'foreman', name: 'Foreman', emoji: '👷' },
  { key: 'coordinator', name: 'Coordinator', emoji: '🎯' },
] as const;
const AGENT_FEATURES = ['alerts', 'safe', 'learn'] as const;

interface SecondaryProduct {
  key: 'unireal' | 'cnc';
  icon: LucideIcon;
  url: string;
  host: string;
  features: readonly string[];
  /** Optional social link rendered under the CTA. */
  facebook?: string;
}

const SECONDARY: SecondaryProduct[] = [
  {
    key: 'unireal',
    icon: GraduationCap,
    url: PRODUCT_URLS.unireal,
    host: 'unireal.study',
    features: ['profiles', 'verified', 'tools'],
  },
  {
    key: 'cnc',
    icon: Cog,
    url: PRODUCT_URLS.cncAssist,
    host: 'Google Play',
    features: ['calc', 'gcode', 'ai'],
    facebook: SOCIAL.facebookCnc,
  },
];

export function Products() {
  const t = useTranslations('home.products');

  return (
    <section id="products" className="container scroll-mt-28 py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('title')}</h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <ScrollReveal className="mt-12 max-w-5xl mx-auto" delay={0.08}>
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
                {PAZNIC_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <span className="text-sm font-medium">{t(`paznic.features.${f}`)}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="w-full">
                <a href={PRODUCT_URLS.paznic} target="_blank" rel="noreferrer">
                  {t('paznic.cta')}
                  <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                </a>
              </Button>

              <p className="text-center text-xs text-muted-foreground">paznic.eu</p>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <div className="mt-6 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {SECONDARY.map(({ key, icon: Icon, url, host, features, facebook }, i) => (
          <ScrollReveal key={key} delay={0.12 + i * 0.06}>
            <Card className="group relative h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/50">
              <BorderBeam size={170} duration={16} delay={4 + i * 4} colorFrom="#4f46e5" colorTo="#06b6d4" />
              <CardContent className="pt-7 flex h-full flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold tracking-tight">{t(`${key}.name`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`${key}.tagline`)}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{t(`${key}.desc`)}</p>

                {key === 'cnc' && (
                  <blockquote className="border-s-2 border-accent ps-4 text-sm italic text-muted-foreground">
                    {t('cnc.why')}
                  </blockquote>
                )}

                <ul className="space-y-2 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      <span className="text-sm font-medium">{t(`${key}.features.${f}`)}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <a href={url} target="_blank" rel="noreferrer">
                      {t(`${key}.cta`)}
                      <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                    </a>
                  </Button>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span>{key === 'cnc' ? t('cnc.meta') : host}</span>
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Facebook className="h-3.5 w-3.5" />
                        {t('cnc.facebook')}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal className="mt-6 max-w-5xl mx-auto" delay={0.1}>
        <Card className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/50">
          <BorderBeam size={220} duration={16} delay={8} colorFrom="#ffaa40" colorTo="#9c40ff" />
          <CardContent className="pt-7 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Radar className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">{t('agents.name')}</h3>
                  <p className="text-sm text-muted-foreground">{t('agents.tagline')}</p>
                </div>
              </div>

              <p className="text-muted-foreground">{t('agents.desc')}</p>

              <blockquote className="border-s-2 border-accent ps-4 text-sm italic text-muted-foreground">
                {t('agents.why')}
              </blockquote>

              <ul className="space-y-2">
                {AGENT_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <span className="text-sm font-medium">{t(`agents.features.${f}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <ul className="grid gap-3 sm:grid-cols-2">
                {AGENTS.map(({ key, name, emoji }) => (
                  <li key={key} className="rounded-xl border border-border/70 bg-background/40 p-3">
                    <p className="flex items-center gap-2 font-semibold" dir="ltr">
                      <span aria-hidden>{emoji}</span>
                      {name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{t(`agents.agents.${key}`)}</p>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" variant="outline" className="h-auto w-full whitespace-normal py-3">
                <Link href="/contact">
                  {t('agents.cta')}
                  <ArrowRight className="h-4 w-4 flex-shrink-0 rtl:rotate-180" />
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">{t('agents.meta')}</p>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </section>
  );
}
