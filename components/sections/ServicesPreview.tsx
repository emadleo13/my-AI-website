'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent } from '@/components/ui/card';
import { BorderBeam } from '@/components/ui/border-beam';
import { SERVICE_CATEGORIES } from '@/lib/services';
import { ScrollReveal } from './ScrollReveal';

/**
 * Home "What I do" section.
 *
 * Deliberately focused on the two core offerings — Chatbot/Voice/Social bots and
 * Software (web, mobile, front-end & back-end APIs). The other categories
 * (workflow automation, technology consulting, resume/LinkedIn) plus Cloud &
 * DevOps live in the footer Services menu, not here, so the home page stays
 * pointed at what we want to win work on.
 */
const FOCUS_KEYS = ['chatbot', 'software'] as const;

/** Sub-items intentionally hidden from the home focus cards. */
const HIDDEN_SUBS: Record<string, string[]> = {
  software: ['cloud'], // Cloud & DevOps lives in the footer Services menu.
};

export function ServicesPreview() {
  const t = useTranslations('home.servicesPreview');
  const tCat = useTranslations('services.categories');

  const focus = FOCUS_KEYS.map(
    (key) => SERVICE_CATEGORIES.find((c) => c.key === key)!,
  );

  return (
    <section className="container py-20 md:py-28">
      <ScrollReveal className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {focus.map(({ key, icon: Icon, sub }, i) => {
          const subs = sub.filter((s) => !HIDDEN_SUBS[key]?.includes(s));
          return (
            <ScrollReveal key={key} delay={i * 0.08}>
              <Link href={`/contact?service=${key}`} className="block h-full">
                <Card className="group relative h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/50">
                  <BorderBeam size={170} duration={16} delay={i * 4} colorFrom="#ffaa40" colorTo="#9c40ff" />
                  <CardContent className="pt-7 space-y-4">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight">{tCat(`${key}.title`)}</h3>
                    <p className="text-muted-foreground">{tCat(`${key}.desc`)}</p>
                    <ul className="space-y-2 pt-1">
                      {subs.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                          <span className="font-semibold">{tCat(`${key}.sub.${s}.title`)}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                      {t('viewAll')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
